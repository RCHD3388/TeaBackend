import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ unique: true })
  @Field()
  username: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string;

  @CreateDateColumn()
  @Field() 
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date; 
}
