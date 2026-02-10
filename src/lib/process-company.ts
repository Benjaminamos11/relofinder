import { supabase } from './supabase';

export const processCompany = async (companySlug: string) => {
    let companyData: any = { slug: companySlug };
    let internalReviews: any[] = [];
    let externalReviews: any[] = [];
    let externalAggregate = { avg: 0, count: 0 };
    let reviewSummary: any = null;
    let tier = "standard";
    let weightedRating = 0;
    let relocatorId: string | null = null;
    let alternatives: any[] = [];
    let isPreferred = false;

    try {
        const { data: relocatorData } = await supabase
            .from("relocators")
            .select(`*, offices:relocator_offices(*)`)
            .eq("slug", companySlug)
            .single();

        if (relocatorData) {
            relocatorId = relocatorData.id;
            tier = relocatorData.tier || "standard";
            companyData = { ...companyData, ...relocatorData };

            companyData.name = relocatorData.name;
            companyData.description =
                relocatorData.seo_summary ||
                "Leading relocation specialist in Switzerland.";
            companyData.bio = relocatorData.bio;
            companyData.faqs = relocatorData.content_blocks?.faqs || [];
            companyData.logo = relocatorData.logo;
            companyData.email = relocatorData.contact_email;
            companyData.phone = relocatorData.phone_number;
            companyData.website = relocatorData.website;
            companyData.founded = relocatorData.founded_year;
            companyData.employees = relocatorData.employee_count
                ? String(relocatorData.employee_count)
                : undefined;
            companyData.services = relocatorData.services || [];
            companyData.regions = relocatorData.regions_served || [];
            companyData.verified = relocatorData.is_verified;

            const mainOffice =
                relocatorData.offices?.find((o: any) => o.is_main) ||
                relocatorData.offices?.[0];
            if (mainOffice) {
                companyData.address = {
                    street: mainOffice.street,
                    city: mainOffice.city,
                    postalCode: mainOffice.zip,
                    canton: "",
                };
            } else if (relocatorData.address_street || relocatorData.address_city) {
                companyData.address = {
                    street: relocatorData.address_street,
                    city: relocatorData.address_city,
                    postalCode: relocatorData.address_zip,
                    canton: "",
                };
            }

            const [reviewsResult, googleReviewsResult, summaryResult, seoResult] =
                await Promise.all([
                    supabase
                        .from("reviews")
                        .select("*, review_replies(*)")
                        .eq("relocator_id", relocatorId)
                        .eq("status", "approved")
                        .order("created_at", { ascending: false }),
                    supabase
                        .from("google_reviews")
                        .select("author_name, rating, review_text, review_date, review_link")
                        .eq("relocator_id", relocatorId)
                        .order("rating", { ascending: false }),
                    supabase
                        .from("review_summaries")
                        .select("*")
                        .eq("relocator_id", relocatorId)
                        .single(),
                    supabase
                        .from("relocators")
                        .select("seo_summary")
                        .eq("id", relocatorId)
                        .single(),
                ]);

            if (reviewsResult.data) internalReviews = reviewsResult.data;

            if (googleReviewsResult.data && googleReviewsResult.data.length > 0) {
                const totalRating = googleReviewsResult.data.reduce(
                    (sum: number, r: any) => sum + r.rating,
                    0,
                );
                externalAggregate = {
                    avg:
                        Math.round(
                            (totalRating / googleReviewsResult.data.length) * 100,
                        ) / 100,
                    count: googleReviewsResult.data.length,
                };
                externalReviews = googleReviewsResult.data.map((review: any) => ({
                    author_name: review.author_name || "Google User",
                    rating: review.rating || 5,
                    body: review.review_text || "",
                    created_at: review.review_date || new Date().toISOString(),
                    link: review.review_link || "",
                    source: "google",
                }));
            }

            reviewSummary = summaryResult.data;
            if (seoResult.data?.seo_summary) {
                if (!reviewSummary) reviewSummary = {};
                reviewSummary.seo_summary = seoResult.data.seo_summary;
            }

            const internalCount = internalReviews.length;
            const externalCount = externalAggregate.count;
            if (internalCount + externalCount > 0) {
                const internalAvg =
                    internalCount > 0
                        ? internalReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                        internalCount
                        : 0;
                const totalWeight = internalCount * 0.6 + externalCount * 0.4;
                weightedRating =
                    totalWeight > 0
                        ? Math.round(
                            ((internalAvg * internalCount * 0.6 +
                                externalAggregate.avg * externalCount * 0.4) /
                                totalWeight) *
                            10,
                        ) / 10
                        : (companyData.rating && typeof companyData.rating === 'object' ? companyData.rating.score : companyData.rating) || 0;
            } else {
                weightedRating = companyData.rating_breakdown?.value || 0;
            }

            const preferredPartnerNames = [
                "Prime Relocation",
                "Welcome Service",
                "Lifestylemanagers",
            ];
            isPreferred = preferredPartnerNames.some(
                (name) => companyData.name && companyData.name.includes(name),
            );

            if (!isPreferred) {
                alternatives = [];
            }
        }
    } catch (error) {
        console.error(`Error processing ${companySlug}:`, error);
    }

    return {
        params: { id: companySlug },
        props: {
            companyData,
            internalReviews,
            externalReviews,
            externalAggregate,
            reviewSummary,
            tier,
            weightedRating,
            alternatives,
            isPreferred,
            relocatorId,
        },
    };
};
