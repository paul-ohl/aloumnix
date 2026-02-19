import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("schools")
export class School {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  location!: string;

  @OneToMany(
    () => Alumnus,
    (alumnus) => alumnus.school,
  )
  alumni!: Alumnus[];

  @OneToMany(
    () => Event,
    (event) => event.school,
  )
  events!: Event[];

  @OneToMany(
    () => JobOffering,
    (jobOffering) => jobOffering.school,
  )
  jobOfferings!: JobOffering[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("alumni")
export class Alumnus {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  fullName!: string;

  @Column()
  graduationYear!: number;

  @Column()
  class!: string;

  @Column()
  schoolSector!: string;

  @Column()
  mail!: string;

  @Column({ nullable: true })
  linkedInProfile?: string;

  @Column({ nullable: true })
  professionalStatus?: string;

  @ManyToOne(
    () => School,
    (school) => school.alumni,
  )
  school!: School;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  location!: string;

  @Column("timestamp")
  datetime!: Date;

  @Column("text")
  details!: string;

  @ManyToOne(
    () => School,
    (school) => school.events,
  )
  school!: School;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("job_offerings")
export class JobOffering {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  sectors?: string;

  @Column("text")
  details!: string;

  @ManyToOne(
    () => School,
    (school) => school.jobOfferings,
  )
  school!: School;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
