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

  @Column({ nullable: true })
  password?: string;

  @Column({ default: false })
  isPasswordSet!: boolean;

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

  @Column({ nullable: true })
  class?: string;

  @Column()
  schoolSector!: string;

  @Column({ unique: true })
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

  @Column({ nullable: true })
  password?: string;

  @Column({ default: false })
  isPasswordSet!: boolean;

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
