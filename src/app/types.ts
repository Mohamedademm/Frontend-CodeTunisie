export interface Course {
  id: string;
  _id?: string;
  title: string;
  description: string;
  content: string; // HTML content support
  category: string; // broadened from union type for admin form flexibility
  duration: string;
  progress?: number;
  icon?: string;
  lessons?: number;
  difficulty: string; // broadened
  price?: string | number;
  isPremium?: boolean;
  isUnlocked?: boolean;
}

export interface Video {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  progress?: number;
  thumbnail?: string;
  url: string;
  views?: number;
  isPremium?: boolean;
}

export interface Test {
  id: string;
  _id?: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  questions: number | Question[];
  progress?: number;
  category: string;
  passed?: boolean;
  score?: number;
  passThreshold?: number;
}

export interface TestAttempt {
  id: string;
  user: string;
  test: string | Test;
  answers: number[];
  score: number;
  passed: boolean;
  timeTaken: number;
  createdAt: string;
}

export interface Question {
  id: string;
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number | string; // Handle both index and value
  explanation: string;
  image?: string;
  category?: string;
  difficulty?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  coursesCompleted: number;
  testsCompleted: number;
  totalScore: number;
  badges: Badge[];
  joinedDate: string;
  currentStreak: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate?: string;
  category?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface Stat {
  label: string;
  value: string | number;
  change?: number;
  icon: string;
}
