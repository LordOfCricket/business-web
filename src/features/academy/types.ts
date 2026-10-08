export interface AcademyOverviewStats {
  totalStudents: number;
  activeCoaches: number;
  upcomingClasses: number;
  upcomingGradings: number;
  upcomingTournaments: number;
  activeBookings: number;
  revenueThisMonth: string;
  averageRating: number;
  totalReviews: number;
}

export interface AcademyBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  contactPhone: string;
  contactEmail: string;
  sports: string[];
  coaches: string[];
  facilities: string[];
  timings: string;
  isMainBranch: boolean;
}

export interface AcademyStudent {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  age: number;
  dateOfBirth: string;
  beltRank: number;
  beltName: string;
  beltColor: string;
  branchName: string;
  batchName: string;
  joinedOn: string;
  attendanceRate: number;
  status: "ACTIVE" | "ON_LEAVE" | "GRADUATED";
}

export interface AcademyCoachMember {
  id: string;
  name: string;
  title: string;
  sports: string[];
  disciplines: string[];
  experienceYears: number;
  assignedBranches: string[];
  phone: string;
  email: string;
  avatarUrl?: string;
}

export interface AcademyBatch {
  id: string;
  name: string;
  program: string;
  branch: string;
  coach: string;
  days: string[];
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  ageGroup: string;
}

export interface AcademyProgram {
  id: string;
  name: string;
  sport: string;
  discipline: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "BLACK_BELT";
  description: string;
  monthlyFee: number;
  durationMonths: number;
}

export interface AcademyGradingEvent {
  id: string;
  title: string;
  sport: string;
  targetBelt: string;
  targetGrade: string;
  eventDate: string;
  examiner: string;
  eligibleCount: number;
  location: string;
  status: "UPCOMING" | "COMPLETED";
}

export interface AcademyAchievement {
  id: string;
  title: string;
  category: "CHAMPIONSHIP" | "MEDAL" | "FEDERATION_AWARD" | "NATIONAL_RECOGNITION";
  role: "ACADEMY" | "COACH" | "STUDENT_SQUAD";
  year: number;
  level: "DISTRICT" | "STATE" | "NATIONAL" | "INTERNATIONAL";
  description: string;
}

export interface AcademyReviewItem {
  id: string;
  author: string;
  role: "STUDENT" | "PARENT" | "ATHLETE";
  rating: number;
  date: string;
  comment: string;
  reply?: {
    text: string;
    repliedAt: string;
  };
}
