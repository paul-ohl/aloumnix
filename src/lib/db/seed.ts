import type { DataSource } from "typeorm";
import { Alumnus, Event, JobOffering, School } from "./entities";

export const seedDatabase = async (dataSource: DataSource) => {
  const schoolRepo = dataSource.getRepository(School);
  const alumnusRepo = dataSource.getRepository(Alumnus);
  const eventRepo = dataSource.getRepository(Event);
  const jobRepo = dataSource.getRepository(JobOffering);

  // Check if seeding is already done
  const count = await schoolRepo.count();
  if (count > 0) {
    console.log("Database already has data. Skipping seed.");
    return;
  }

  console.log("Seeding database...");

  // Create Schools
  const schoolsData = [
    { name: "Tech University", location: "San Francisco, CA" },
    { name: "Business Academy", location: "New York, NY" },
    { name: "Design Institute", location: "London, UK" },
  ];

  const schools = await schoolRepo.save(schoolsData);

  // Create Alumni
  for (const school of schools) {
    const alumniData = [
      {
        fullName: `John Doe (${school.name})`,
        graduationYear: 2020,
        class: "A",
        schoolSector: "Engineering",
        mail: "john@example.com",
        school,
      },
      {
        fullName: `Jane Smith (${school.name})`,
        graduationYear: 2021,
        class: "B",
        schoolSector: "Marketing",
        mail: "jane@example.com",
        school,
      },
    ];
    await alumnusRepo.save(alumniData);

    // Create Events
    const eventsData = [
      {
        name: `${school.name} Annual Meetup`,
        location: "Grand Hall",
        datetime: new Date(Date.now() + 86400000 * 7), // 7 days from now
        details: "Networking event for all alumni.",
        school,
      },
    ];
    await eventRepo.save(eventsData);

    // Create Job Offerings
    const jobsData = [
      {
        name: "Senior Software Engineer",
        sectors: "Technology",
        details: `Great opportunity at a startup near ${school.location}.`,
        school,
      },
    ];
    await jobRepo.save(jobsData);
  }

  console.log("Seeding completed successfully.");
};
