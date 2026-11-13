-- CreateTable
CREATE TABLE `Moderator` (
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Moderator_userId_key`(`userId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Administrator` (
    `moderatorId` INTEGER NOT NULL,

    UNIQUE INDEX `Administrator_moderatorId_key`(`moderatorId`),
    PRIMARY KEY (`moderatorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RankingList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `moderatorId` INTEGER NOT NULL,

    INDEX `RankingList_moderatorId_idx`(`moderatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsor` (
    `userId` INTEGER NOT NULL,
    `pib` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Sponsor_userId_key`(`userId`),
    UNIQUE INDEX `Sponsor_pib_key`(`pib`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resource_url` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `sponsorId` INTEGER NOT NULL,
    `adStatsId` INTEGER NOT NULL,

    UNIQUE INDEX `Ad_adStatsId_key`(`adStatsId`),
    INDEX `Ad_sponsorId_idx`(`sponsorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdStats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad_costs` DOUBLE NOT NULL,
    `number_of_views` INTEGER NOT NULL DEFAULT 0,
    `revenue` DOUBLE NOT NULL,
    `sponsorId` INTEGER NOT NULL,

    INDEX `AdStats_sponsorId_idx`(`sponsorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SponsoredRecipes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_SponsoredRecipes_AB_unique`(`A`, `B`),
    INDEX `_SponsoredRecipes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ModeratedRecipes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ModeratedRecipes_AB_unique`(`A`, `B`),
    INDEX `_ModeratedRecipes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RankedRecipes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RankedRecipes_AB_unique`(`A`, `B`),
    INDEX `_RankedRecipes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TrackedRecipes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TrackedRecipes_AB_unique`(`A`, `B`),
    INDEX `_TrackedRecipes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Moderator` ADD CONSTRAINT `Moderator_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Administrator` ADD CONSTRAINT `Administrator_moderatorId_fkey` FOREIGN KEY (`moderatorId`) REFERENCES `Moderator`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RankingList` ADD CONSTRAINT `RankingList_moderatorId_fkey` FOREIGN KEY (`moderatorId`) REFERENCES `Moderator`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `Sponsor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ad` ADD CONSTRAINT `Ad_sponsorId_fkey` FOREIGN KEY (`sponsorId`) REFERENCES `Sponsor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ad` ADD CONSTRAINT `Ad_adStatsId_fkey` FOREIGN KEY (`adStatsId`) REFERENCES `AdStats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdStats` ADD CONSTRAINT `AdStats_sponsorId_fkey` FOREIGN KEY (`sponsorId`) REFERENCES `Sponsor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SponsoredRecipes` ADD CONSTRAINT `_SponsoredRecipes_A_fkey` FOREIGN KEY (`A`) REFERENCES `Recipe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SponsoredRecipes` ADD CONSTRAINT `_SponsoredRecipes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Sponsor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ModeratedRecipes` ADD CONSTRAINT `_ModeratedRecipes_A_fkey` FOREIGN KEY (`A`) REFERENCES `Moderator`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ModeratedRecipes` ADD CONSTRAINT `_ModeratedRecipes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Recipe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RankedRecipes` ADD CONSTRAINT `_RankedRecipes_A_fkey` FOREIGN KEY (`A`) REFERENCES `RankingList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RankedRecipes` ADD CONSTRAINT `_RankedRecipes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Recipe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TrackedRecipes` ADD CONSTRAINT `_TrackedRecipes_A_fkey` FOREIGN KEY (`A`) REFERENCES `AdStats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TrackedRecipes` ADD CONSTRAINT `_TrackedRecipes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Recipe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
