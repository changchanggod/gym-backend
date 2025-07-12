import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEventRelations1752307827662 implements MigrationInterface {
    name = 'UserEventRelations1752307827662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users_join_events_events\` (\`usersId\` int NOT NULL, \`eventsId\` int NOT NULL, INDEX \`IDX_6b35ef4a0e02617ab4a7ce9110\` (\`usersId\`), INDEX \`IDX_dc81dfc155e291a8004631fa22\` (\`eventsId\`), PRIMARY KEY (\`usersId\`, \`eventsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`participants\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`organizer\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`joinEventId\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`hostEventId\``);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`organizerId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_1024d476207981d1c72232cf3ca\` FOREIGN KEY (\`organizerId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users_join_events_events\` ADD CONSTRAINT \`FK_6b35ef4a0e02617ab4a7ce9110d\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`users_join_events_events\` ADD CONSTRAINT \`FK_dc81dfc155e291a8004631fa22c\` FOREIGN KEY (\`eventsId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users_join_events_events\` DROP FOREIGN KEY \`FK_dc81dfc155e291a8004631fa22c\``);
        await queryRunner.query(`ALTER TABLE \`users_join_events_events\` DROP FOREIGN KEY \`FK_6b35ef4a0e02617ab4a7ce9110d\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_1024d476207981d1c72232cf3ca\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`organizerId\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`hostEventId\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`joinEventId\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`organizer\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`participants\` text NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_dc81dfc155e291a8004631fa22\` ON \`users_join_events_events\``);
        await queryRunner.query(`DROP INDEX \`IDX_6b35ef4a0e02617ab4a7ce9110\` ON \`users_join_events_events\``);
        await queryRunner.query(`DROP TABLE \`users_join_events_events\``);
    }

}
