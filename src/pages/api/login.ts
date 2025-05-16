export async function POST({ request, redirect }) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/x-www-form-urlencoded')) {
      return new Response('Unsupported Media Type', { status: 415 });
    }

    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return new Response('Email and password are required', { status: 400 });
    }

    // Hardcoded credentials check
    if (email === 'bw@expat-savvy.ch' && password === '12Benjamin!') {
      return redirect('/admin');
    }

    // Redirect back to login with error
    return redirect('/login?error=invalid');
  } catch (error) {
    return new Response(`Login error: ${error.message}`, { status: 500 });
  }
}