// ==========================
// STORAGE HELPERS
// ==========================
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// ==========================
// REGISTER
// ==========================
if (document.getElementById("registerForm")) {
    registerForm.addEventListener("submit", e => {
        e.preventDefault();

        let users = getUsers();

        let user = {
            name: name.value,
            email: email.value,
            password: password.value,
            role: role.value,
            courses: [],
            results: [],
            assignments: []
        };

        users.push(user);
        saveUsers(users);

        alert("Registered!");
        window.location.href = "login.html";
    });
}

// ==========================
// LOGIN
// ==========================
if (document.getElementById("loginForm")) {
    loginForm.addEventListener("submit", e => {
        e.preventDefault();

        let users = getUsers();

        let user = users.find(u =>
            u.email === loginEmail.value &&
            u.password === loginPassword.value
        );

        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));

            window.location.href =
                user.role === "admin" ? "admin.html" : "Student.html";
        } else {
            alert("Invalid login");
        }
    });
}

// ==========================
// LOGOUT
// ==========================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function back() {
    window.location.href = "student.html";
    
}

function backtoadmin() {
    window.location.href = "admin.html";
    
}
// ==========================
// COURSES INIT
// ==========================
if (!localStorage.getItem("courses")) {
    localStorage.setItem("courses", JSON.stringify([
        { name: "Physics", files: [] },
        { name: "Chemistry", files: [] },
        { name: "Biology", files: [] }
    ]));
}

// ==========================
// COURSE ACTIONS
// ==========================
function enroll(course) {
    let users = getUsers();
    let user = getCurrentUser();

    let found = users.find(u => u.email === user.email);

    if (!found.courses.includes(course)) {
        found.courses.push(course);
        saveUsers(users);
        location.reload();
    }
}

function unenroll(course) {
    let users = getUsers();
    let user = getCurrentUser();

    let found = users.find(u => u.email === user.email);
    found.courses = found.courses.filter(c => c !== course);

    saveUsers(users);
    location.reload();
}

function openCourse(name) {
    localStorage.setItem("currentCourse", name);
    window.location.href = "course-view.html";
}

// ==========================
// LOAD COURSES (STUDENT)
// ==========================
if (document.getElementById("courseList")) {
    let courses = JSON.parse(localStorage.getItem("courses"));
    let users = getUsers();
    let user = getCurrentUser();
    let found = users.find(u => u.email === user.email);

    courseList.innerHTML = "";

    courses.forEach(c => {
        let enrolled = found.courses.includes(c.name);

        let li = document.createElement("li");

        li.innerHTML = `
            ${c.name}
            ${
                enrolled
                ? `
                  <button onclick="openCourse('${c.name}')">Open</button>
                  <button onclick="unenroll('${c.name}')">Unenroll</button>
                  `
                : `<button onclick="enroll('${c.name}')">Enroll</button>`
            }
        `;

        courseList.appendChild(li);
    });
}

// ==========================
// COURSE VIEW PAGE
// ==========================
if (document.getElementById("courseTitle")) {
    let name = localStorage.getItem("currentCourse");
    courseTitle.innerText = name;

    let courses = JSON.parse(localStorage.getItem("courses"));
    let course = courses.find(c => c.name === name);

    fileList.innerHTML = "";

    if (!course || course.files.length === 0) {
        fileList.innerHTML = "<li>No materials yet</li>";
    } else {
        course.files.forEach(f => {
            let li = document.createElement("li");
            li.textContent = f;
            fileList.appendChild(li);
        });
    }
}

// ==========================
// ADMIN: MANAGE COURSES
// ==========================
if (document.getElementById("adminCourseList")) {
    loadAdminCourses();
}

function loadAdminCourses() {
    let courses = JSON.parse(localStorage.getItem("courses"));

    adminCourseList.innerHTML = "";

    courses.forEach(c => {
        let li = document.createElement("li");

        li.innerHTML = `
            ${c.name}
            <button onclick="removeCourse('${c.name}')">Delete</button>
            <button onclick="addFile('${c.name}')">Add File</button>
        `;

        adminCourseList.appendChild(li);
    });
}

function addCourse() {
    let name = newCourse.value;

    let courses = JSON.parse(localStorage.getItem("courses"));
    courses.push({ name, files: [] });

    localStorage.setItem("courses", JSON.stringify(courses));
    loadAdminCourses();
}

function removeCourse(name) {
    let courses = JSON.parse(localStorage.getItem("courses"));

    courses = courses.filter(c => c.name !== name);

    localStorage.setItem("courses", JSON.stringify(courses));
    loadAdminCourses();
}

function addFile(courseName) {
    let file = prompt("Enter file name");

    let courses = JSON.parse(localStorage.getItem("courses"));
    let course = courses.find(c => c.name === courseName);

    course.files.push(file);

    localStorage.setItem("courses", JSON.stringify(courses));
    alert("File added!");
}

// ==========================
// RESULTS
// ==========================
if (document.getElementById("resultsList")) {
    let users = getUsers();
    let user = getCurrentUser();
    let found = users.find(u => u.email === user.email);

    if (found.results) {
        found.results.forEach(r => {
            let li = document.createElement("li");
            li.textContent = `${r.course} - ${r.grade}`;
            resultsList.appendChild(li);
        });
    }
}

// ==========================
// ADMIN ASSIGN RESULTS
// ==========================
function loadStudentsDropdown() {
    let select = document.getElementById("studentSelect");
    if (!select) return;

    let users = getUsers();

    // 🔥 clear old list first
    select.innerHTML = "";

    users
        .filter(u => u.role === "student")
        .forEach(u => {
            let option = document.createElement("option");
            option.value = u.email;
            option.textContent = u.name;
            select.appendChild(option);
        });
}

// RUN WHEN PAGE LOADS
if (document.getElementById("studentSelect")) {
    loadStudentsDropdown();
}
function assignResult() {
    let email = document.getElementById("studentSelect").value;
    let course = document.getElementById("courseSelect").value;
    let grade = document.getElementById("grade").value;

    let users = getUsers();
    let student = users.find(u => u.email === email);

    if (!student.results) student.results = [];

    student.results.push({ course, grade });

    saveUsers(users);

    alert("Result assigned successfully!");
    // 🔥 refresh dropdown (important)
    loadStudentsDropdown();
}

function loadStudentCourses() {
    let email = document.getElementById("studentSelect").value;
    let courseSelect = document.getElementById("courseSelect");

    let users = getUsers();
    let student = users.find(u => u.email === email);

    courseSelect.innerHTML = "";

    if (!student || !student.courses || student.courses.length === 0) {
        courseSelect.innerHTML = "<option>No enrolled courses</option>";
        return;
    }

    student.courses.forEach(c => {
        let option = document.createElement("option");
        option.value = c;
        option.textContent = c;
        courseSelect.appendChild(option);
    });
}
// ==========================
// ASSIGNMENTS
// ==========================
function uploadAssignment() {
    let file = assignmentFile.value;

    let users = getUsers();
    let user = getCurrentUser();
    let found = users.find(u => u.email === user.email);

    if (!found.assignments) found.assignments = [];

    found.assignments.push(file);
    saveUsers(users);

    alert("Uploaded!");
}

// VIEW ASSIGNMENTS (ADMIN)
if (document.getElementById("assignmentList")) {
    let users = getUsers();

    users.forEach(u => {
        if (u.assignments) {
            u.assignments.forEach(a => {
                let li = document.createElement("li");
                li.textContent = `${u.name}: ${a}`;
                assignmentList.appendChild(li);
            });
        }
    });
}

// ==========================
// SEARCH USERS
// ==========================
function searchUser() {
    let input = search.value.toLowerCase();
    let users = getUsers();

    userList.innerHTML = "";

    users
        .filter(u => u.name.toLowerCase().includes(input))
        .forEach(u => {
            let li = document.createElement("li");
            li.textContent = `${u.name} (${u.role})`;
            userList.appendChild(li);
        });
}

// ==========================
// LOADER
// ==========================
function startLoader() {
    let progress = document.getElementById("progress");
    let percent = document.getElementById("percent");

    if (!progress || !percent) return;

    let count = 0;

    let interval = setInterval(() => {
        count += Math.random() * 5;
        count = Math.min(count, 100);

        progress.style.width = count + "%";
        percent.innerText = Math.floor(count) + "%";

        if (count >= 100) {
            clearInterval(interval);
            document.getElementById("loader").style.display = "none";
        }
    }, 30);
}

window.onload = startLoader;
