export type Hostel = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  adminName: string;
  adminEmail: string;
  students: number;
  rooms: number;
  status: "active" | "disabled";
  subscription: "trial" | "active" | "expired";
  createdAt: string;
};

export const hostels: Hostel[] = [
  { id: "H001", name: "Sunrise Boys Hostel", address: "12 College Rd, Bengaluru", phone: "+91 9845012345", email: "admin@sunrise.edu", adminName: "Ramesh Kumar", adminEmail: "ramesh@sunrise.edu", students: 248, rooms: 86, status: "active", subscription: "active", createdAt: "2024-01-12" },
  { id: "H002", name: "Lotus Girls Residency", address: "45 MG Road, Pune", phone: "+91 9823011223", email: "admin@lotus.edu", adminName: "Priya Sharma", adminEmail: "priya@lotus.edu", students: 312, rooms: 110, status: "active", subscription: "active", createdAt: "2023-11-04" },
  { id: "H003", name: "Greenfield Hostel", address: "9 Park St, Kolkata", phone: "+91 9831022334", email: "admin@greenfield.edu", adminName: "Anil Das", adminEmail: "anil@greenfield.edu", students: 178, rooms: 64, status: "active", subscription: "trial", createdAt: "2025-03-20" },
  { id: "H004", name: "Skyline Mens Hostel", address: "22 Anna Salai, Chennai", phone: "+91 9844033445", email: "info@skyline.edu", adminName: "Vignesh R", adminEmail: "vignesh@skyline.edu", students: 96, rooms: 40, status: "disabled", subscription: "expired", createdAt: "2023-06-18" },
  { id: "H005", name: "Heritage Womens Hostel", address: "5 Civil Lines, Delhi", phone: "+91 9810044556", email: "admin@heritage.edu", adminName: "Meera Iyer", adminEmail: "meera@heritage.edu", students: 220, rooms: 80, status: "active", subscription: "active", createdAt: "2024-08-09" },
];

export type Student = {
  id: string; roll: string; name: string; photo?: string;
  mobile: string; parentMobile: string; room: string; course: string;
  joinDate: string; status: "in" | "out";
};

export const students: Student[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `STU${String(1001 + i).padStart(4, "0")}`,
  roll: `2024-CS-${String(i + 1).padStart(3, "0")}`,
  name: ["Aarav Patel","Ishita Rao","Karan Mehta","Sneha Reddy","Rohan Kapoor","Diya Singh","Aditya Nair","Tara Joshi","Vivaan Shah","Anaya Gupta","Rahul Verma","Pooja Iyer","Arjun Khanna","Neha Pillai","Kabir Malhotra","Saanvi Desai","Yash Bhatt","Riya Menon","Dev Chauhan","Mira Krishnan","Aryan Saxena","Zara Ahmed","Nikhil Bose","Aditi Rao"][i],
  mobile: `+91 98${String(10000000 + i * 12345).padStart(8, "0")}`,
  parentMobile: `+91 99${String(20000000 + i * 12345).padStart(8, "0")}`,
  room: `R-${100 + (i % 12)}`,
  course: ["B.Tech CSE","B.Tech ECE","BBA","B.Sc","MBA","B.Com"][i % 6],
  joinDate: `2024-0${(i % 9) + 1}-1${i % 9}`,
  status: i % 5 === 0 ? "out" : "in",
}));

export type Room = { number: string; capacity: number; occupied: number };
export const rooms: Room[] = Array.from({ length: 12 }).map((_, i) => ({
  number: `R-${100 + i}`, capacity: 4, occupied: (i % 4) + 1,
}));

export type Staff = { id: string; name: string; role: string; mobile: string; email: string };
export const staff: Staff[] = [
  { id: "S01", name: "Suresh Babu", role: "Warden", mobile: "+91 9844001122", email: "suresh@hostel.edu" },
  { id: "S02", name: "Lakshmi Rao", role: "Asst. Warden", mobile: "+91 9844001133", email: "lakshmi@hostel.edu" },
  { id: "S03", name: "Manoj Tiwari", role: "Cook", mobile: "+91 9844001144", email: "manoj@hostel.edu" },
  { id: "S04", name: "Geeta Devi", role: "Housekeeping", mobile: "+91 9844001155", email: "geeta@hostel.edu" },
];

export type Guard = { id: string; name: string; mobile: string; email: string };
export const guards: Guard[] = [
  { id: "G01", name: "Ravi Kumar", mobile: "+91 9844002211", email: "ravi@hostel.edu" },
  { id: "G02", name: "Mahesh Singh", mobile: "+91 9844002222", email: "mahesh@hostel.edu" },
  { id: "G03", name: "Dinesh Yadav", mobile: "+91 9844002233", email: "dinesh@hostel.edu" },
];

export type Leave = {
  id: string; studentId: string; studentName: string; room: string;
  reason: string; fromDate: string; toDate: string; outTime: string; returnTime: string;
  parentApproval: "pending" | "approved" | "rejected";
  hostelApproval: "pending" | "approved" | "rejected";
  finalStatus: "pending parent" | "pending hostel" | "approved" | "rejected";
};

export const leaves: Leave[] = students.slice(0, 14).map((s, i) => {
  const stages = ["pending parent","pending hostel","approved","rejected"] as const;
  const fs = stages[i % 4];
  return {
    id: `LV${String(2001 + i).padStart(4, "0")}`,
    studentId: s.id, studentName: s.name, room: s.room,
    reason: ["Family Function","Medical","Festival","Personal","Hometown Visit"][i % 5],
    fromDate: `2026-06-${String((i % 28) + 1).padStart(2, "0")}`,
    toDate: `2026-06-${String((i % 28) + 3).padStart(2, "0")}`,
    outTime: "08:00 AM", returnTime: "08:00 PM",
    parentApproval: fs === "pending parent" ? "pending" : fs === "rejected" && i % 2 === 0 ? "rejected" : "approved",
    hostelApproval: fs === "approved" ? "approved" : fs === "rejected" ? "rejected" : "pending",
    finalStatus: fs,
  };
});

export const outsideStudents = students.filter(s => s.status === "out").map(s => ({
  ...s, outTime: "09:15 AM", expectedReturn: "07:30 PM",
}));

export const returnedToday = students.slice(8, 14).map(s => ({
  ...s, returnTime: ["06:42 PM","07:10 PM","05:55 PM","08:01 PM","06:30 PM","07:48 PM"][students.slice(8,14).indexOf(s)],
}));

export const weeklyLeaves = [
  { day: "Mon", requests: 12, approved: 9 },
  { day: "Tue", requests: 18, approved: 14 },
  { day: "Wed", requests: 9, approved: 7 },
  { day: "Thu", requests: 22, approved: 18 },
  { day: "Fri", requests: 31, approved: 26 },
  { day: "Sat", requests: 41, approved: 35 },
  { day: "Sun", requests: 16, approved: 13 },
];

export const monthlyGrowth = [
  { month: "Jan", hostels: 8, students: 1240 },
  { month: "Feb", hostels: 11, students: 1480 },
  { month: "Mar", hostels: 14, students: 1820 },
  { month: "Apr", hostels: 16, students: 2010 },
  { month: "May", hostels: 19, students: 2310 },
  { month: "Jun", hostels: 23, students: 2680 },
];
