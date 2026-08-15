const cfg = window.EMERALD_CONFIG;
const configured = cfg.SUPABASE_URL.startsWith("http") && !cfg.SUPABASE_ANON_KEY.includes("ضع_");
const sb = configured ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const $ = id => document.getElementById(id);
const money = n => Number(n || 0).toLocaleString("ar-YE");

async function init(){
  if(!sb){ $("loginMsg").textContent="لم يتم ربط قاعدة البيانات بعد. أكمل إعداد Supabase في ملف js/config.js."; return; }
  const {data:{session}} = await sb.auth.getSession();
  if(session) await showBank(session.user);
}
init();

$("loginForm").addEventListener("submit", async e=>{
  e.preventDefault();
  if(!sb) return;
  $("loginMsg").textContent="جارٍ الدخول...";
  const {data,error}=await sb.auth.signInWithPassword({
    email:$("email").value.trim(), password:$("password").value
  });
  if(error){ $("loginMsg").textContent=error.message; return; }
  $("loginMsg").textContent="";
  await showBank(data.user);
});

$("logoutBtn").addEventListener("click", async()=>{
  if(sb) await sb.auth.signOut();
  $("bankView").classList.add("hidden");
  $("logoutBtn").classList.add("hidden");
  $("loginView").classList.remove("hidden");
});

async function showBank(user){
  $("loginView").classList.add("hidden");
  $("bankView").classList.remove("hidden");
  $("logoutBtn").classList.remove("hidden");

  const {data:member,error}=await sb.from("members").select("*").eq("user_id",user.id).single();
  if(error){ alert("لم يتم العثور على ملف العضو."); return; }

  $("memberName").textContent=member.display_name || "عضو";
  $("memberId").textContent=member.member_id;
  $("role").textContent=member.role || "member";
  $("balance").textContent=money(member.balance);

  await loadTransactions(member.member_id);
}

async function loadTransactions(memberId){
  const {data,error}=await sb.from("transactions").select("*")
    .or(`sender_id.eq.${memberId},receiver_id.eq.${memberId}`)
    .order("created_at",{ascending:false}).limit(30);

  const box=$("transactions");
  if(error || !data?.length){box.innerHTML='<p class="muted">لا توجد عمليات بعد.</p>';return;}
  box.innerHTML=data.map(t=>{
    const incoming=t.receiver_id===memberId;
    return `<div class="tx"><span>${incoming?"تحويل وارد":"تحويل صادر"}<br><small>${new Date(t.created_at).toLocaleString("ar-YE")}</small></span>
    <strong class="${incoming?"plus":"minus"}">${incoming?"+":"-"}${money(t.amount)}</strong></div>`;
  }).join("");
}

$("transferForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const msg=$("transferMsg");
  const receiver=$("receiverId").value.trim();
  const amount=Number($("amount").value);
  msg.textContent="جارٍ تنفيذ التحويل...";
  if(!receiver || !Number.isInteger(amount) || amount<=0){msg.textContent="أدخل بيانات صحيحة.";return;}

  const {data,error}=await sb.rpc("transfer_balance",{
    p_receiver_id:receiver,p_amount:amount
  });
  if(error){msg.textContent=error.message;return;}
  msg.textContent="تم التحويل بنجاح.";
  $("amount").value="";
  await showBank((await sb.auth.getUser()).data.user);
});
