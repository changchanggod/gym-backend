import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration752391928943 implements MigrationInterface {
  name = 'Migration4.01752391928943';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users_join_events_events` DROP FOREIGN KEY `FK_dc81dfc155e291a8004631fa22c`'
    );
    await queryRunner.query(
      'ALTER TABLE `events` ADD `participantsMaxCount` int NOT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users_join_events_events` DROP FOREIGN KEY `FK_dc81dfc155e291a8004631fa22c`'
    );
    await queryRunner.query(
      'ALTER TABLE `events` DROP COLUMN `participantsMaxCount`'
    );
  }
}
