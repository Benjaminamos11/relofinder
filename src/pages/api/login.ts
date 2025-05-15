export async function POST({ request, redirect }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  // Hardcoded credentials check
  if (email === 'bw@expat-savvy.ch' && password === '12Benjamin!') {
    // Set a cookie or session here if needed
    return redirect('/admin');
  }

  // Redirect back to login with error
  return redirect('/login?error=invalid');
}