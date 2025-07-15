import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1752568133135 implements MigrationInterface {
    name = 'CreateUserTable1752568133135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`comments\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`content\` text NOT NULL,
                \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`userId\` int NOT NULL,
                \`eventId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`events\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` text NOT NULL,
                \`type\` varchar(255) NOT NULL,
                \`startTime\` timestamp NOT NULL,
                \`endTime\` timestamp NOT NULL,
                \`location\` varchar(255) NOT NULL,
                \`participantsMaxCount\` int NOT NULL,
                \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`organizerId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`username\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL DEFAULT '这个人貌似很神秘呢···',
                \`account\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`email\` varchar(255) NULL DEFAULT '未设置',
                \`phone\` varchar(255) NULL DEFAULT '未设置',
                \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`),
                UNIQUE INDEX \`IDX_dd44b05034165835d6dcc18d68\` (\`account\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`users_join_events_events\` (
                \`usersId\` int NOT NULL,
                \`eventsId\` int NOT NULL,
                INDEX \`IDX_6b35ef4a0e02617ab4a7ce9110\` (\`usersId\`),
                INDEX \`IDX_dc81dfc155e291a8004631fa22\` (\`eventsId\`),
                PRIMARY KEY (\`usersId\`, \`eventsId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`comments\`
            ADD CONSTRAINT \`FK_7e8d7c49f218ebb14314fdb3749\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comments\`
            ADD CONSTRAINT \`FK_555f90935f4c6d26c351af601fc\` FOREIGN KEY (\`eventId\`) REFERENCES \`events\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_1024d476207981d1c72232cf3ca\` FOREIGN KEY (\`organizerId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`users_join_events_events\`
            ADD CONSTRAINT \`FK_6b35ef4a0e02617ab4a7ce9110d\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`users_join_events_events\`
            ADD CONSTRAINT \`FK_dc81dfc155e291a8004631fa22c\` FOREIGN KEY (\`eventsId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users_join_events_events\` DROP FOREIGN KEY \`FK_dc81dfc155e291a8004631fa22c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users_join_events_events\` DROP FOREIGN KEY \`FK_6b35ef4a0e02617ab4a7ce9110d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_1024d476207981d1c72232cf3ca\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_555f90935f4c6d26c351af601fc\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_7e8d7c49f218ebb14314fdb3749\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_dc81dfc155e291a8004631fa22\` ON \`users_join_events_events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6b35ef4a0e02617ab4a7ce9110\` ON \`users_join_events_events\`
        `);
        await queryRunner.query(`
            DROP TABLE \`users_join_events_events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_dd44b05034165835d6dcc18d68\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`events\`
        `);
        await queryRunner.query(`
            DROP TABLE \`comments\`
        `);
    }

}
