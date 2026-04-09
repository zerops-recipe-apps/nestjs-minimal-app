import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('greetings')
export class Greeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column({ nullable: true })
  language: string;

  @CreateDateColumn()
  createdAt: Date;
}
