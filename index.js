// ******************************************//
// ********** Logout **********
// ******************************************//
const signoutBtn = document.getElementById("signout");
signoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "/frontend/authentication/login.html";
});
// ******************************************//
// ********** Navbar logic **********
// ******************************************//

const navLinks = document.querySelectorAll("nav ul li a");
const sections = document.querySelectorAll(".content-section");

function showPage(pageId, event){
  event.preventDefault();
  sections.forEach(section => section.classList.remove("active"));
  const target = document.getElementById(pageId);
  if(target) target.classList.add("active");

  event.target.classList.add("active");
}

// ******************************************//
// ********** Chatbot UI Toggle **********
// ******************************************//

const chatbotSection = document.getElementById("chatbot-section");
const openBtn = document.getElementById("open-btn");
const closeBtn = document.getElementById("close-btn");

openBtn.addEventListener("click", () => {
  chatbotSection.classList.add("active");
  openBtn.style.display = "none";
});

closeBtn.addEventListener("click", () => {
  chatbotSection.classList.remove("active");
  openBtn.style.display = "block";
});
// ******************************************//
// ********** Chatbot Messaging Logic **********
// ******************************************//

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

async function chatConversation() {
  const message = userInput.value.trim();
  if(!message) return;

  // Display user message
  const userDiv = document.createElement("div");
  userDiv.classList.add("user-message");
  userDiv.innerText = message;
  chatBox.appendChild(userDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  userInput.value = "";

  // Show typing message
  const typingMsg = document.createElement("div");
  typingMsg.className = "bot-message";
  typingMsg.innerText = "Typing...";
  chatBox.appendChild(typingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  try{
    const response = await fetch("http://localhost:5000/api/chatbot", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message})
    });

    const data = await response.json();

    chatBox.removeChild(typingMsg);

    const botDiv = document.createElement("div");
    botDiv.classList.add("bot-message");
    botDiv.innerText = data.reply || "I did not understood that.";
    chatBox.appendChild(botDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }catch(error){
    console.error(error);
  }
}

sendBtn.addEventListener("click", chatConversation);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    chatConversation();
  }
});
// ******************************************//
// ********** Sidebar logic **********
// ******************************************//
const navBar = document.querySelector("nav");
const navigationBtn = document.querySelector(".navigation-btn");
navigationBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  navBar.classList.add("active")
})
document.addEventListener("click", (e) => {
  navBar.classList.remove("active");
});
// **************************************************************//
// *************** Display user info with image ******************
// *************************************************************//

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

document.querySelectorAll("#studentName").forEach(student => {student.innerText = loggedInUser.name});
document.querySelectorAll("#regNumber").forEach(item => {item.innerText = loggedInUser.reg_number});
document.querySelectorAll("#studentCourse").forEach(item => {item.innerText = loggedInUser.course});

document.getElementById("first-name").innerText = loggedInUser.name.split(' ')[0];
document.getElementById("second-name").innerText = loggedInUser.name.split(' ')[1];
document.getElementById("last-name").innerText = loggedInUser.name.split(' ')[2];
document.getElementById("main-mobile").innerText = loggedInUser.phone_number;
document.getElementById("alt-mobile").innerText = loggedInUser.alt_phone_number;
document.getElementById("online-mobile").innerText = loggedInUser.phone_number;
document.getElementById("main-email").innerText = loggedInUser.email;
document.getElementById("alt-email").innerText = loggedInUser.email;
document.getElementById("online-email").innerText = loggedInUser.email;

// ***************************************************//
// ************* Fetch timetable **********************
// **************************************************//

async function fetchTimeTable() {

  try{
    const res = await fetch("http://localhost:5000/api/timetables");

    const data = await res.json();

    const tableBody = document.getElementById("tableBody");

    tableBody.innerHTML = ""

    data.timetable.forEach(item => {

    const formatedExamDate = item.exam_date ? new Date(item.exam_date).toLocaleDateString(): "_";

    const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.unit_code}</td>
        <td>${item.unit_name}</td>
        <td>${item.lecturer}</td>
        <td>${item.start_time}</td>
        <td>${item.end_time}</td>
        <td>${item.venue}</td>
        <td>${formatedExamDate}</td>
      `

      tableBody.appendChild(row);
    });
    
  }catch{

  }
  
}
fetchTimeTable();
// ********************************************************//
// ************* Fetch results and GPA **********************
// ********************************************************//

function gradePoints(grade){
  switch(grade){
    case "A": return 5;
    case "B": return 4.5;
    case "C": return 4;
    case "D": return 3.5;
    case "E": return 3;
    case "F": return 2;
    default: return 0;
  }
}

async function fetchResults(){
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const regNumber = loggedInUser.reg_number;
  

  try{
    const res = await fetch(`http://localhost:5000/api/results?reg_number=${encodeURIComponent(regNumber)}`);
    const data = await res.json();

    console.log("results data:", data);

    const tableBody = document.getElementById("resultsTableBody");
    tableBody.innerHTML = "";

    let totalPoints = 0;
    let totalHours = 0;

    data.results.forEach(item =>{
      const hours = Number(item.academic_hours);
      const points = gradePoints(item.grade);

      totalPoints += points * hours;
      totalHours += hours;
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.unit_code}</td>
        <td>${item.unit_name}</td>
        <td>${item.academic_hours}</td>
        <td>${item.marks}</td>
        <td>${item.grade}</td>
      `
    tableBody.appendChild(row);

    const gpa = (totalPoints / totalHours).toFixed(2);

    document.getElementById("target-gpa").innerHTML = 5;

    document.querySelector("#gpa strong").innerText = gpa;
    document.getElementById("target-gpa").innerText = "5.0";

    let gpaPercentage = (gpa / 5) * 100;
    if (gpaPercentage > 100) gpaPercentage = 100;

    const gpaBar = document.querySelector("#gpaBar span");
    gpaBar.style.width = gpaPercentage + "%";

    const gpaMsg = document.getElementById("gpa-percentage");
    gpaMsg.innerText = `You are ${Math.round(gpaPercentage)}% towards your GPA goal`;


    });

  }catch(error){

  }
}
fetchResults();
// ******************************************//
// ************* Fetch fees **********************
// ******************************************//

async function fetchFees() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const regNumber = loggedInUser.reg_number;

  try {
    const res = await fetch(`http://localhost:5000/api/fees?reg_number=${encodeURIComponent(regNumber)}`);
    const data = await res.json();

    const tableBody = document.getElementById("feesTableBody");
    tableBody.innerHTML = "";

    let latestBalance = 0;
    let totalPaid = 0;
    let totalDebits = 0;

    const displayAmount = (value) => 
      value === null || Number(value) === 0 ? "": value;

    if (data.fees.length > 0) {
      data.fees.forEach(fee => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(fee.date).toLocaleDateString()}</td>
          <td>${fee.description}</td>
          <td>${displayAmount(fee.debits)}</td>
          <td>${displayAmount(fee.credits)}</td>
          <td>${fee.balance}</td>
        `;
        tableBody.appendChild(row);

        totalPaid += fee.credits ? parseFloat(fee.credits) : 0;
        totalDebits += fee.debits ? parseFloat(fee.debits) : 0;
        latestBalance = fee.balance; 
      });

         // Mini-card warning
    const miniDesc = document.getElementById("fees-minicard-desc");
    const miniCard = document.getElementById("fees-minicard");
    if (latestBalance > 0) {
      miniDesc.innerHTML = "<strong>Payment overdue:</strong> please clear your fees balance before the deadline";
      miniCard.style.background = "#fac2c2";
      miniDesc.style.color = "red";
    } else {
      miniDesc.innerHTML = "All fees are cleared";
      miniCard.style.background = "#c2fac2";
      miniDesc.style.color = "green";
    }

      let percentagePaid = totalDebits ? (totalPaid / totalDebits) * 100 : 0;
      document.getElementById("feesFill").style.width = percentagePaid + "%";
      document.getElementById("fees-percentage").innerText = percentagePaid.toFixed() + "%";

      document.getElementById("balance").textContent = latestBalance;
      document.getElementById("paid").textContent = totalPaid;
    } else {
      feesMinicardMesc.innerText = "No fees found";
      document.getElementById("feesFill").style.width = "0%";
      document.getElementById("fees-percentage").innerText = "0%";
      document.getElementById("balance").textContent = "0";
      document.getElementById("paid").textContent = "0";
    }

  } catch (error) {
    console.error("Error fetching fees:", error);
  }
}


fetchFees();

// ******************************************//
// *********** Course registration ***********
// ******************************************//

document.getElementById("courseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    alert("Session expired, please login");
    return;
  }

  const regNumber = loggedInUser.reg_number;

  const unitCodeInputs = document.querySelectorAll(".unit-code");
  const groupInputs = document.querySelectorAll(".group");
  const examInputs = document.querySelectorAll(".examType");

  for (let i = 0; i < unitCodeInputs.length; i++) {
    const unit_code = unitCodeInputs[i].value.trim();
    const group = groupInputs[i].value;
    const exam_type = examInputs[i].value;

    if (!unit_code) continue;

    try {
      const response = await fetch("http://localhost:5000/api/register-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reg_number: regNumber,
          unit_code,
          exam_type,
          group
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || `Failed to register ${unit_code}`);
      }

    } catch (error) {
      console.error("Registration error:", error);
      alert("Network error while registering units");
      return;
    }
  }

  e.target.reset();

  try {
    const res = await fetch(
      `http://localhost:5000/api/register-course?reg_number=${encodeURIComponent(regNumber)}`
    );
    const coursesData = await res.json();

    courseTableBody.innerHTML = "";

    coursesData.courses.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.unit_code}</td>
        <td>${item.unit_name}</td>
        <td>${item.exam_type}</td>
        <td>${item.group}</td>
        <td>${item.lecturer}</td>
      `;
      courseTableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Fetch courses error:", err);
  }
});

// ******************************************//
// *********** Request section ***********
// ******************************************//

document.getElementById("requestForm").addEventListener("submit", async(e) => {
  e.preventDefault();

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    alert("Session expired, please login");
    return;
  }

  const regNumber = loggedInUser.reg_number;

  const requestType = document.getElementById("request-type").value;
  const requestContent = document.getElementById("text-area").value;

  const requestDetails ={
    reg_number:regNumber,
    request_type:requestType,
    request:requestContent
  };

  try{
    const response = await fetch("http://localhost:5000/api/request",{ 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestDetails)
  });

  const data = await response.json();

  if(response.ok){
    alert(data.message);
  }else{
    alert(data.message);
  }
  }catch(error){
    console.error(error);
  }

});

async function fetchRequest() {
  try{
    const tableBody = document.getElementById("approvalTBody");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const regNumber = loggedInUser.reg_number;

    if(!loggedInUser){
      return("session expired please log in first")
    }

    const response = await fetch(`http://localhost:5000/api/request/fetch-request?reg_number=${encodeURIComponent(regNumber)}`);

    const data = await response.json();

    if(response.ok){
      console.log(data.message)
    } else{
      console.log(data.message);
    }

    data.requests.forEach(item => {
      const formatedRequestDate =  item.created_at ? new Date(item.created_at).toLocaleDateString(): "_";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.request_type}</td>
        <td>${formatedRequestDate}</td>
        <td>${item.remark}</td>
      `
      tableBody.appendChild(row)
    })
  }catch(error){
    console.error(error);
    
  }
}

fetchRequest();


// =====================
// THEME TOGGLE SCRIPT
// =====================

const themeBtn = document.getElementById("themeToggle");
const body = document.body;

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    body.classList.add(savedTheme);
    themeBtn.textContent = savedTheme === "dark-theme" ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// Toggle theme on button click
themeBtn.addEventListener("click", () => {
    body.classList.toggle("dark-theme");

    if (body.classList.contains("dark-theme")) {
        localStorage.setItem("theme", "dark-theme");
        themeBtn.textContent = "☀️ Light Mode";
    } else {
        localStorage.setItem("theme", "light-theme");
        themeBtn.textContent = "🌙 Dark Mode";
    }
});

