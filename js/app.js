const config = window.EMERALD_CONFIG;

const supabaseClient = window.supabase.createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");

const loginMessage = document.getElementById("loginMessage");
const transferMessage = document.getElementById("transferMessage");

async function loadProfile() {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    loginPage.style.display = "block";
    dashboard.style.display = "none";
    return;
  }

  const { data, error } = await supabaseClient
    .from("members")
    .select("member_id, display_name, role, balance")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  loginPage.style.display = "none";
  dashboard.style.display = "block";

  document.getElementById("userInfo").textContent =
    data.display_name;

  document.getElementById("balance").textContent =
    Number(data.balance).toLocaleString();

  document.getElementById("memberId").textContent =
    data.member_id;

  document.getElementById("displayName").textContent =
    data.display_name;

  document.getElementById("role").textContent =
    data.role;

  await loadTransactions();
}

async function loadTransactions() {
  const {
    data,
    error
  } = await supabaseClient
    .from("transactions")
    .select("*")
    .order("created_at", {
      ascending: false
    })
    .limit(20);

  const container =
    document.getElementById("transactions");

  if (error) {
    container.innerHTML =
      '<div class="empty">تعذر تحميل العمليات</div>';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML =
      '<div class="empty">لا توجد عمليات حتى الآن</div>';
    return;
  }

  container.innerHTML = data.map(transaction => `
    <div class="transaction">
      <span>${transaction.type}</span>
      <strong>
        ${Number(transaction.amount).toLocaleString()}
      </strong>
    </div>
  `).join("");
}

document
  .getElementById("loginButton")
  .addEventListener("click", async () => {

    loginMessage.textContent =
      "جاري تسجيل الدخول...";

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      loginMessage.textContent =
        error.message;
     
