"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input } from "@/components/ui";
import {
  AcademyIcon,
  BranchesIcon,
  UsersGroupIcon,
  BeltAwardIcon,
  CalendarDaysIcon,
  TournamentIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckmarkIcon,
} from "@/components/landing/LandingIcons";
import {
  SAMPLE_ACADEMY_STATS,
  SAMPLE_ACADEMY_BRANCHES,
  SAMPLE_ACADEMY_COACHES,
  SAMPLE_ACADEMY_STUDENTS,
  SAMPLE_ACADEMY_PROGRAMS,
  SAMPLE_ACADEMY_BATCHES,
  SAMPLE_ACADEMY_GRADINGS,
  SAMPLE_ACADEMY_ACHIEVEMENTS,
  SAMPLE_ACADEMY_REVIEWS,
} from "./mockData";
import type { AcademyBranch, AcademyStudent, AcademyReviewItem } from "./types";

interface Props {
  orgId: string;
  orgName?: string;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Academy Profile" },
  { id: "sports", label: "Sports & Disciplines" },
  { id: "branches", label: "Branches (3)" },
  { id: "coaches", label: "Coaches & Staff (12)" },
  { id: "students", label: "Students (248)" },
  { id: "batches", label: "Programs & Batches" },
  { id: "timetable", label: "Timetable" },
  { id: "facilities", label: "Facilities" },
  { id: "gradings", label: "Gradings & Tournaments" },
  { id: "achievements", label: "Achievements" },
  { id: "reviews", label: "Reviews (84)" },
  { id: "settings", label: "Settings" },
];

export function AcademyDashboard({ orgId, orgName = "LordOfSportz Karate Academy" }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [reviews, setReviews] = useState<AcademyReviewItem[]>(SAMPLE_ACADEMY_REVIEWS);
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});

  const handleReplySubmit = (reviewId: string) => {
    const text = replyInput[reviewId]?.trim();
    if (!text) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              reply: { text, repliedAt: new Date().toISOString().split("T")[0]! },
            }
          : r
      )
    );
    setReplyInput((prev) => ({ ...prev, [reviewId]: "" }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Academy Top Header Bar */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-900">
            <AcademyIcon className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker text-[11px] text-brand-700">SPORTS ACADEMY WORKSPACE</span>
              <Badge tone="success">Verified Academy</Badge>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{orgName}</h1>
            <p className="text-xs text-muted">
              Karate &amp; Martial Arts · Shotokan &amp; Goju-Ryu · 3 Active Branches
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/workspace"
            className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted hover:border-ink/30 hover:text-ink"
          >
            Switch Workspace
          </Link>
          <Button size="sm">
            + New Student Enrollment
          </Button>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="flex overflow-x-auto border-b border-line pb-1 gap-1">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-2 text-xs font-semibold whitespace-nowrap transition rounded-lg ${
                active
                  ? "bg-brand-900 text-paper shadow-2xs"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Key KPI Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Total Active Students</p>
                <p className="mt-2 text-3xl font-bold text-ink">{SAMPLE_ACADEMY_STATS.totalStudents}</p>
              </div>
              <p className="mt-3 text-xs text-brand-700 font-medium">↑ 18 new this month</p>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Active Coaches</p>
                <p className="mt-2 text-3xl font-bold text-ink">{SAMPLE_ACADEMY_STATS.activeCoaches}</p>
              </div>
              <p className="mt-3 text-xs text-muted">Across 3 branches</p>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Upcoming Gradings</p>
                <p className="mt-2 text-3xl font-bold text-ink">{SAMPLE_ACADEMY_STATS.upcomingGradings}</p>
              </div>
              <p className="mt-3 text-xs text-amber-700 font-medium">Nov 15 (42 candidates)</p>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Monthly Academy Revenue</p>
                <p className="mt-2 text-3xl font-bold text-ink">{SAMPLE_ACADEMY_STATS.revenueThisMonth}</p>
              </div>
              <p className="mt-3 text-xs text-brand-700 font-medium">94% Collection Rate</p>
            </Card>
          </div>

          {/* Quick Action Alerts */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="kicker text-[11px] text-brand-900">TODAY&apos;S SCHEDULE &amp; CLASSES</span>
                <span className="text-xs font-medium text-brand-900">Saturday Schedule</span>
              </div>
              <h3 className="mt-2 text-base font-semibold text-brand-900">
                Morning Tigers &amp; Weekend Competition Dojo Batches
              </h3>
              <p className="mt-1 text-xs text-brand-800">
                3 classes running today across Main Dojo and West Branch. All instructors checked in.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setActiveTab("batches")}>
                  Manage Batches
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setActiveTab("timetable")}>
                  Open Timetable
                </Button>
              </div>
            </div>

            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">Rating &amp; Reputation</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-ink">{SAMPLE_ACADEMY_STATS.averageRating}</span>
                  <span className="text-sm font-semibold text-amber-600">★★★★★</span>
                </div>
                <p className="mt-1 text-xs text-muted">Based on {SAMPLE_ACADEMY_STATS.totalReviews} verified student and parent reviews</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className="mt-4 text-xs font-semibold text-brand-700 text-left hover:underline"
              >
                Respond to reviews →
              </button>
            </Card>
          </div>

          {/* Recent Activity Table */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Recent Academy Activity</h3>
              <span className="text-xs text-muted">Real-time sync</span>
            </div>
            <ul className="flex flex-col divide-y divide-line/60 text-xs">
              <li className="py-2.5 flex items-center justify-between">
                <span>Student <strong>Aarav Mehta</strong> completed attendance criteria for 3rd Kyu grading exam.</span>
                <span className="text-muted">10 mins ago</span>
              </li>
              <li className="py-2.5 flex items-center justify-between">
                <span>Batch enrollment fee received for <strong>Junior Intermediate</strong> (₹2,500).</span>
                <span className="text-muted">1 hour ago</span>
              </li>
              <li className="py-2.5 flex items-center justify-between">
                <span>Shihan Rajiv Sharma updated tournament squad selection for <strong>National Cup</strong>.</span>
                <span className="text-muted">Yesterday</span>
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* Tab 2: Profile */}
      {activeTab === "profile" && (
        <Card className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold text-ink">Deep Academy Profile</h3>
            <p className="text-xs text-muted">Complete sports identity displayed to athletes and parents</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Academy Name" defaultValue={orgName} />
            <Input label="Founded Year" defaultValue="2016" />
            <Input label="Head Instructor / Technical Director" defaultValue="Shihan Rajiv Sharma (5th Dan)" />
            <Input label="Federation Affiliation" defaultValue="All India Karate Federation (AIKF) / WKF" />
            <Input label="Official Contact Phone" defaultValue="+91 98201 12345" />
            <Input label="Contact Email" defaultValue="contact@lordofsportz.com" />
            <Input label="Official Website" defaultValue="https://karate.lordofsportz.com" />
            <Input label="Instagram / Social" defaultValue="@lordofsportz_karate" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink">Academy Philosophy &amp; Description</label>
            <textarea
              className="h-24 rounded-xl border border-ink/15 bg-surface p-3 text-xs"
              defaultValue="Dedicated to authentic Shotokan and Goju-Ryu martial arts education. Focusing on discipline, self-defense, competition excellence, and physical wellness for children and adults."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button>Save Profile Changes</Button>
          </div>
        </Card>
      )}

      {/* Tab 3: Sports & Disciplines */}
      {activeTab === "sports" && (
        <Card className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold text-ink">Sports, Disciplines &amp; Styles</h3>
            <p className="text-xs text-muted">Configure the exact styles taught at this academy</p>
          </div>

          <div className="rounded-2xl bg-canvas p-5 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-ink text-sm">Primary Sport: Karate</h4>
                <p className="text-xs text-muted">Traditional Martial Art &amp; Olympic Sport</p>
              </div>
              <Badge tone="success">Primary Sport</Badge>
            </div>

            <div className="mt-4 border-t border-line pt-3">
              <p className="text-xs font-semibold text-brand-900 uppercase">Disciplines &amp; Styles Taught:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium border border-line">
                  🥋 Shotokan Karate
                </span>
                <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium border border-line">
                  🥋 Goju-Ryu
                </span>
                <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium border border-line">
                  🥊 Competitive WKF Kumite (Sparring)
                </span>
                <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium border border-line">
                  🥋 Traditional Kata &amp; Bunkai
                </span>
                <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium border border-line">
                  🛡️ Women &amp; Youth Self-Defense
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-line pt-3">
              <p className="text-xs font-semibold text-brand-900 uppercase">Belt Progression System:</p>
              <p className="mt-1 text-xs text-muted">
                Standard 9-tier Kyu system (White → Yellow → Orange → Green → Blue → Purple → Brown 3rd/2nd/1st Kyu) to Black Belt (1st Dan Shodan up to 5th Dan).
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm">+ Add Discipline / Style</Button>
          </div>
        </Card>
      )}

      {/* Tab 4: Branches */}
      {activeTab === "branches" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Branch Management</h3>
              <p className="text-xs text-muted">
                Academies can operate 0, 1, or multiple locations with dedicated coaches and facilities.
              </p>
            </div>
            <Button size="sm">+ Add New Branch</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {SAMPLE_ACADEMY_BRANCHES.map((b) => (
              <Card key={b.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="kicker text-[10px] text-brand-700">BRANCH</span>
                    {b.isMainBranch && <Badge tone="success">Headquarters</Badge>}
                  </div>
                  <h4 className="mt-2 text-base font-semibold text-ink">{b.name}</h4>
                  <p className="mt-1 text-xs text-muted">{b.address}, {b.city}</p>
                  <p className="mt-1 text-xs text-muted">Phone: {b.contactPhone}</p>

                  <div className="mt-4 border-t border-line pt-3">
                    <p className="text-[11px] font-semibold text-ink">Assigned Instructors:</p>
                    <ul className="mt-1 flex flex-col gap-1 text-xs text-muted">
                      {b.coaches.map((c) => (
                        <li key={c}>• {c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-[11px] font-semibold text-ink">Facilities:</p>
                    <p className="mt-1 text-xs text-muted">{b.facilities.join(" · ")}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-line flex justify-end">
                  <Button size="sm" variant="secondary">
                    Edit Branch Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Coaches & Staff */}
      {activeTab === "coaches" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Academy Coaches &amp; Staff</h3>
              <p className="text-xs text-muted">Role-based instructor roster with specialized sport disciplines</p>
            </div>
            <Button size="sm">+ Invite Coach</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {SAMPLE_ACADEMY_COACHES.map((coach) => (
              <Card key={coach.id} className="flex flex-col justify-between">
                <div>
                  <span className="kicker text-[10px] text-brand-700">{coach.title}</span>
                  <h4 className="mt-1 text-base font-semibold text-ink">{coach.name}</h4>
                  <p className="text-xs text-muted">{coach.experienceYears} Years Coaching Experience</p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {coach.disciplines.map((d) => (
                      <span key={d} className="rounded bg-canvas px-2 py-0.5 text-[11px] text-muted">
                        {d}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-muted">
                    Branches: {coach.assignedBranches.join(", ")}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex justify-between items-center text-xs">
                  <span className="text-muted">{coach.phone}</span>
                  <Link href="/profile" className="font-semibold text-brand-700 hover:underline">
                    View Profile →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Students */}
      {activeTab === "students" && (
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Student Athlete Roster</h3>
              <p className="text-xs text-muted">Track belt ranks, attendance, and grading readiness</p>
            </div>
            <Button size="sm">+ Enroll Student</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas/70 text-muted">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Age / Gender</th>
                  <th className="p-3">Belt Rank</th>
                  <th className="p-3">Batch &amp; Branch</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {SAMPLE_ACADEMY_STUDENTS.map((stu) => (
                  <tr key={stu.id} className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-ink">{stu.name}</td>
                    <td className="p-3 text-muted">{stu.age} yrs · {stu.gender}</td>
                    <td className="p-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold text-white text-[11px]"
                        style={{ backgroundColor: stu.beltColor }}
                      >
                        {stu.beltName}
                      </span>
                    </td>
                    <td className="p-3 text-muted">{stu.batchName} ({stu.branchName})</td>
                    <td className="p-3">
                      <span className="font-semibold text-brand-700">{stu.attendanceRate}%</span>
                    </td>
                    <td className="p-3">
                      <Badge tone="success">{stu.status}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <button type="button" className="text-brand-700 font-semibold hover:underline">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 7: Programs & Batches */}
      {activeTab === "batches" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Programs &amp; Weekly Batches</h3>
              <p className="text-xs text-muted">Batch capacity, schedules, and instructor allocations</p>
            </div>
            <Button size="sm">+ Create Batch</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {SAMPLE_ACADEMY_BATCHES.map((batch) => (
              <Card key={batch.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Badge tone="neutral">{batch.program}</Badge>
                    <span className="text-xs font-semibold text-brand-700">
                      {batch.enrolled} / {batch.capacity} Enrolled
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-semibold text-ink">{batch.name}</h4>
                  <p className="text-xs text-muted">Branch: {batch.branch}</p>
                  <p className="text-xs text-muted">Coach: {batch.coach}</p>

                  <div className="mt-3 rounded-xl bg-canvas p-3 ring-1 ring-line">
                    <p className="text-[11px] font-semibold text-ink">Schedule:</p>
                    <p className="text-xs text-muted">{batch.days.join(", ")}</p>
                    <p className="text-xs font-semibold text-brand-900 mt-1">
                      {batch.startTime} - {batch.endTime}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex justify-end">
                  <Button size="sm" variant="secondary">
                    Edit Batch
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Timetable */}
      {activeTab === "timetable" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Weekly Visual Timetable</h3>
              <p className="text-xs text-muted">Class distribution across Monday to Sunday</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">Filter by Branch</Button>
              <Button size="sm">+ Add Slot</Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs mt-2 overflow-x-auto min-w-[700px]">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <div key={day} className="flex flex-col gap-2 rounded-2xl bg-canvas p-3 ring-1 ring-line">
                <p className="font-semibold text-ink">{day}</p>
                {day === "Monday" || day === "Wednesday" || day === "Friday" ? (
                  <div className="rounded-xl bg-brand-50 p-2 text-left border border-brand-200">
                    <p className="font-semibold text-brand-900 text-[11px]">06:30 - 07:45</p>
                    <p className="text-[10px] text-brand-800">Morning Tigers</p>
                    <p className="text-[9px] text-muted">Main Dojo</p>
                  </div>
                ) : null}
                {day === "Tuesday" || day === "Thursday" || day === "Saturday" ? (
                  <div className="rounded-xl bg-amber-50 p-2 text-left border border-amber-200">
                    <p className="font-semibold text-amber-900 text-[11px]">17:30 - 19:00</p>
                    <p className="text-[10px] text-amber-800">Evening Warriors</p>
                    <p className="text-[9px] text-muted">Main Dojo</p>
                  </div>
                ) : null}
                {day === "Saturday" || day === "Sunday" ? (
                  <div className="rounded-xl bg-purple-50 p-2 text-left border border-purple-200">
                    <p className="font-semibold text-purple-900 text-[11px]">08:00 - 10:30</p>
                    <p className="text-[10px] text-purple-800">Competition Dojo</p>
                    <p className="text-[9px] text-muted">West Branch</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 9: Facilities */}
      {activeTab === "facilities" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Academy Facilities</h3>
              <p className="text-xs text-muted">Dojos, gym equipment, and training gear across branches</p>
            </div>
            <Button size="sm">+ Add Facility</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-2">
            {[
              { name: "Olympic Tatami Mat Hall", branch: "Main Dojo", count: "2 Mats (10m x 10m)" },
              { name: "Strength & Conditioning Floor", branch: "Main Dojo", count: "Squat racks, kettlebells" },
              { name: "Punching Bag & Makiwara Bay", branch: "All Branches", count: "8 Heavy Bags" },
              { name: "First Aid & Ice Station", branch: "All Branches", count: "Certified Medical Kit" },
            ].map((f) => (
              <div key={f.name} className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                <h4 className="font-semibold text-ink text-xs">{f.name}</h4>
                <p className="text-[11px] text-muted mt-1">{f.branch}</p>
                <p className="text-[11px] font-semibold text-brand-700 mt-2">{f.count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 10: Gradings & Tournaments */}
      {activeTab === "gradings" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Belt Gradings &amp; Tournaments</h3>
              <p className="text-xs text-muted">Schedule belt advancement examinations and track competitive entries</p>
            </div>
            <Button size="sm">+ Schedule Grading Exam</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {SAMPLE_ACADEMY_GRADINGS.map((g) => (
              <Card key={g.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="kicker text-[10px] text-brand-700">EXAMINATION</span>
                    <Badge tone="warning">{g.status}</Badge>
                  </div>
                  <h4 className="mt-2 text-base font-semibold text-ink">{g.title}</h4>
                  <p className="text-xs text-muted mt-1">Target Rank: {g.targetBelt} ({g.targetGrade})</p>
                  <p className="text-xs text-muted">Date: {g.eventDate} · Venue: {g.location}</p>
                  <p className="text-xs text-muted">Examiners: {g.examiner}</p>

                  <div className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-900 border border-brand-200">
                    <strong>{g.eligibleCount} Candidates</strong> currently eligible by attendance &amp; tenure
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-line flex justify-end gap-2">
                  <Button size="sm" variant="secondary">Review Candidates</Button>
                  <Button size="sm">Export Exam Sheets</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 11: Achievements */}
      {activeTab === "achievements" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Structured Honors &amp; Achievements</h3>
              <p className="text-xs text-muted">Official medals, state awards, and team championships</p>
            </div>
            <Button size="sm">+ Add Achievement</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-2">
            {SAMPLE_ACADEMY_ACHIEVEMENTS.map((ach) => (
              <div key={ach.id} className="rounded-2xl bg-canvas p-5 ring-1 ring-line flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-900">
                      {ach.level}
                    </span>
                    <span className="text-xs font-semibold text-muted">{ach.year}</span>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-ink leading-snug">{ach.title}</h4>
                  <p className="mt-2 text-xs text-muted">{ach.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-line text-[11px] text-brand-800 font-medium">
                  Category: {ach.category} · Role: {ach.role}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 12: Reviews */}
      {activeTab === "reviews" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Context-Aware Academy Reviews</h3>
              <p className="text-xs text-muted">Direct feedback from verified students and parents</p>
            </div>
            <Badge tone="success">4.92 / 5.0 (84 Reviews)</Badge>
          </div>

          <div className="flex flex-col gap-4">
            {reviews.map((rev) => (
              <Card key={rev.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-ink text-sm">{rev.author}</span>
                    <span className="ml-2 text-xs text-muted">({rev.role})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-600 font-bold">{"★".repeat(rev.rating)}</span>
                    <span className="text-xs text-muted">{rev.date}</span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-muted">{rev.comment}</p>

                {rev.reply ? (
                  <div className="rounded-xl bg-canvas p-3 text-xs border border-line">
                    <p className="font-semibold text-brand-900">Official Response from Academy:</p>
                    <p className="mt-1 text-muted">{rev.reply.text}</p>
                    <span className="mt-1 block text-[10px] text-muted">{rev.reply.repliedAt}</span>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write an official response as Academy Administrator..."
                      className="flex-1 rounded-xl border border-ink/15 bg-canvas px-3 py-1.5 text-xs"
                      value={replyInput[rev.id] ?? ""}
                      onChange={(e) =>
                        setReplyInput({ ...replyInput, [rev.id]: e.target.value })
                      }
                    />
                    <Button size="sm" onClick={() => handleReplySubmit(rev.id)}>
                      Post Reply
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 13: Settings */}
      {activeTab === "settings" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-ink">Academy Operations Settings</h3>
          <p className="text-xs text-muted">Verification credentials, student admission policies, and billing rules</p>
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <Input label="Student Admission Status" defaultValue="Accepting New Enrollments" />
            <Input label="Default Monthly Fee Currency" defaultValue="INR (₹)" />
            <Input label="Parent WhatsApp Notifications" defaultValue="Enabled" />
            <Input label="Belt Exam Minimum Tenure" defaultValue="3 Months per Kyu" />
          </div>
          <div className="flex justify-end pt-4 border-t border-line">
            <Button>Save Settings</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
