// ---- Supabase setup ----
const SUPABASE_URL = "https://nlqzanjivjfkftvazrvi.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_M3WiVkgt6yctuilI5Q0IjQ_djrAu238"
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ---- Element references ----
const showFormBtn = document.getElementById('show-form-btn')
const guestBtn = document.getElementById('guest-btn')
const loginForm = document.getElementById('login-form')
const logoImg = document.getElementById('logo-img')
const errorMsg = document.getElementById('error-msg')

// ---- Show the login form ----
showFormBtn.addEventListener('click', () => {
  showFormBtn.style.display = 'none'
  guestBtn.style.display = 'none'
  logoImg.style.width = '150px'
  loginForm.style.display = 'flex'
  loginForm.style.flexDirection = 'column'
})

// ---- Handle login submit ----
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    errorMsg.textContent = error.message
  } else {
    window.location.href = "home.html" // change to wherever logged-in users should land
  }
})

// ---- Guest button ----
guestBtn.addEventListener('click', () => {
  window.location.href = "home.html" // change to your guest landing page
})
