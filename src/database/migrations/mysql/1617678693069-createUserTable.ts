import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';
import { AppConfig } from "../../../common/constants/app-config";

export class createUserTable1617678693069 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}
