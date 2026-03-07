import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
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
@Unique(["mail", "school"])
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

  @Column("text")
  details!: string;

  @Column({ type: "jsonb", nullable: true })
  additional_info?: Record<string, unknown>;

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

@Entity("alumnus_otps")
export class AlumnusOtp {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Alumnus, { onDelete: "CASCADE" })
  alumnus!: Alumnus;

  @Column()
  code!: string;

  @Column("timestamp")
  expiresAt!: Date;

  @Column({ default: false })
  used!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
