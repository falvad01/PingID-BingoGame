const NumberDAO = require("../DAO/NumberDAO");
const UserDAO = require("../DAO/UserDAO");
const SeasonDAO = require("../DAO/SeasonDAO");

/**
 * Winner Service
 * Contains all business logic for determining season winners
 */
class WinnerService {

    /**
     * Get winners for a season (line and bingo)
     * @param {number} seasonId - Optional, if null uses active season
     * @returns {Promise<Object>} - { lineWinner, bingoWinner }
     */
    async getSeasonWinners(seasonId = null) {
        try {
            // Get active season if not specified
            let targetSeasonId = seasonId;
            if (!targetSeasonId) {
                const activeSeason = await SeasonDAO.getActiveSeason();
                if (!activeSeason) {
                    throw new Error("No active season found");
                }
                targetSeasonId = activeSeason.id;
            }

            // Get all numbers for this season, ordered by creation time
            const numbersFilter = { seasonId: targetSeasonId };
            const numbers = await NumberDAO.getAllNumbers(numbersFilter);

            // IMPORTANT: getAllNumbers returns DESC order, but we need ASC to find first winner
            // Reverse the array to process numbers chronologically (oldest first)
            numbers.reverse();

            // Track each user's numbers
            const userNumbers = {};
            let lineWinner = null;
            let bingoWinner = null;

            // Process numbers in chronological order
            for (const numberEntry of numbers) {
                const userId = numberEntry.user_id;
                const num = numberEntry.number;
                const timestamp = numberEntry.created_at;

                // Initialize user tracking if not exists
                if (!userNumbers[userId]) {
                    userNumbers[userId] = {
                        numbers: new Set(),
                        user: numberEntry.User
                    };
                }

                // Add the number to user's set
                userNumbers[userId].numbers.add(num);

                // Check for line winner (if not found yet)
                if (!lineWinner && this.hasCompletedLine(userNumbers[userId].numbers)) {
                    const completedDecade = this.getCompletedDecade(userNumbers[userId].numbers);
                    lineWinner = {
                        userId: userId,
                        username: numberEntry.User.username,
                        name_surname: numberEntry.User.name_surname,
                        profile_image: numberEntry.User.profile_image,
                        achievedAt: timestamp,
                        completedDecade: completedDecade
                    };
                }

                // Check for bingo winner (if not found yet)
                if (!bingoWinner && this.hasCompletedBingo(userNumbers[userId].numbers)) {
                    bingoWinner = {
                        userId: userId,
                        username: numberEntry.User.username,
                        name_surname: numberEntry.User.name_surname,
                        profile_image: numberEntry.User.profile_image,
                        achievedAt: timestamp,
                        numberCount: userNumbers[userId].numbers.size
                    };
                }

                // Break early if both winners found
                if (lineWinner && bingoWinner) {
                    break;
                }
            }

            console.info(`Found ${numbers.length} numbers for season ${targetSeasonId}`);
            console.info(`Tracking ${Object.keys(userNumbers).length} users`);
            console.info(`Line winner:`, lineWinner ? `User ${lineWinner.userId}` : 'None');
            console.info(`Bingo winner:`, bingoWinner ? `User ${bingoWinner.userId}` : 'None');

            return {
                lineWinner,
                bingoWinner
            };
        } catch (error) {
            console.error("Error in WinnerService.getSeasonWinners:", error);
            throw error;
        }
    }

    /**
     * Check if a user has completed a line (10 consecutive numbers in a decade)
     * @param {Set} numbers - Set of numbers the user has
     * @returns {boolean}
     */
    hasCompletedLine(numbers) {
        // Check each decade from 10-19, 20-29, ..., 90-99
        for (let decadeStart = 10; decadeStart <= 90; decadeStart += 10) {
            let count = 0;
            for (let i = decadeStart; i < decadeStart + 10; i++) {
                if (numbers.has(i)) {
                    count++;
                }
            }
            if (count === 10) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get which decade was completed (for line winner)
     * @param {Set} numbers - Set of numbers the user has
     * @returns {string} - e.g., "40-49"
     */
    getCompletedDecade(numbers) {
        for (let decadeStart = 10; decadeStart <= 90; decadeStart += 10) {
            let count = 0;
            for (let i = decadeStart; i < decadeStart + 10; i++) {
                if (numbers.has(i)) {
                    count++;
                }
            }
            if (count === 10) {
                return `${decadeStart}-${decadeStart + 9}`;
            }
        }
        return "";
    }

    /**
     * Check if a user has completed bingo (all 90 numbers from 10-99)
     * @param {Set} numbers - Set of numbers the user has
     * @returns {boolean}
     */
    hasCompletedBingo(numbers) {
        // Must have exactly 90 unique numbers
        if (numbers.size < 90) {
            return false;
        }

        // Check if all numbers from 10-99 are present
        for (let i = 10; i <= 99; i++) {
            if (!numbers.has(i)) {
                return false;
            }
        }
        return true;
    }
}

module.exports = new WinnerService();
