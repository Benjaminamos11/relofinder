export async function POST({ request, redirect }) {
  try {
    let email;
    let password;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const body = await request.text();
      const params = new URLSearchParams(body);
      email = params.get('email');
      password = params.get('password');
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      email = formData.get('email');
      password = formData.get('password');
    } else {
      return new Response('Unsupported content type', { status: 415 });
    }

    // Hardcoded credentials check
    if (email === 'bw@expat-savvy.ch' && password === '12Benjamin!') {
      // Set a cookie or session here if needed
      return redirect('/admin');
    }

    // Redirect back to login with error
    return redirect('/login?error=invalid');
  } catch (error) {
    console.error('Login error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}