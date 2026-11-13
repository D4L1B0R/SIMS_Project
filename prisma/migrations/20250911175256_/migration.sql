-- CreateTable
CREATE TABLE `Recipe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `preparation_time` INTEGER NOT NULL,
    `heaviness` ENUM('LIGHT', 'MEDIUM', 'HEAVY') NOT NULL,
    `category` ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'DRINK') NOT NULL,
    `number_of_views` INTEGER NOT NULL DEFAULT 0,
    `number_of_portions` INTEGER NOT NULL,
    `chefBeginnerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChefBeginner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `privileged_user` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `ChefBeginner_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_chefBeginnerId_fkey` FOREIGN KEY (`chefBeginnerId`) REFERENCES `ChefBeginner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChefBeginner` ADD CONSTRAINT `ChefBeginner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
