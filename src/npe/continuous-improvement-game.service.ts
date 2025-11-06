import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubPKPTaskManager } from './services/npe-manager-auth.service';

/**
 * Game State for Continuous Improvement
 */
export interface GameState {
  subPKPId: string;
  currentLevel: number;
  experience: number;
  nextLevelExperience: number;

  // Performance metrics
  streak: number; // Consecutive successful tasks
  bestStreak: number;
  totalPoints: number;

  // Achievements unlocked
  achievements: Achievement[];

  // Current challenges
  activeChallenges: Challenge[];
  completedChallenges: string[];

  // Skill progression
  skills: Record<string, SkillLevel>;

  // Leaderboard position
  rank: number;
  percentile: number;
}

/**
 * Achievement
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    experience: number;
    autonomyBoost?: number;
    capabilityUnlock?: string;
  };
}

/**
 * Challenge
 */
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'speed' | 'quality' | 'efficiency' | 'innovation';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requirements: {
    tasksToComplete: number;
    targetSuccessRate: number;
    targetQuality: number;
    timeLimit?: number;
  };
  progress: {
    tasksCompleted: number;
    currentSuccessRate: number;
    currentQuality: number;
  };
  reward: {
    experience: number;
    points: number;
    achievement?: string;
  };
  expiresAt?: Date;
}

/**
 * Skill Level
 */
export interface SkillLevel {
  name: string;
  level: number;
  experience: number;
  nextLevelExperience: number;
  bonuses: string[];
}

/**
 * Continuous Improvement Game Manager
 * Gamifies the autonomous agent experience to encourage self-improvement
 */
@Injectable()
export class ContinuousImprovementGameManager {
  private readonly logger = new Logger(ContinuousImprovementGameManager.name);

  // Game states for each sub-PKP
  private gameStates = new Map<string, GameState>();

  // Global leaderboard
  private leaderboard: Array<{
    subPKPId: string;
    points: number;
    rank: number;
  }> = [];

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.logger.log('🎮 Continuous Improvement Game Manager initialized');
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Track task completions
    this.eventEmitter.on(
      'task.completed',
      (event: {
        subPKPId: string;
        success: boolean;
        duration: number;
        quality: number;
        taskType: string;
      }) => {
        this.handleTaskCompletion(event);
      },
    );

    // Track learning events
    this.eventEmitter.on(
      'ai.learned',
      (event: { subPKPId: string; insight: string; improvement: number }) => {
        this.handleLearning(event);
      },
    );

    // Track innovation
    this.eventEmitter.on(
      'innovation.detected',
      (event: { subPKPId: string; innovation: string; impact: number }) => {
        this.handleInnovation(event);
      },
    );
  }

  /**
   * Initialize game state for sub-PKP
   */
  initializeGameState(subPKP: SubPKPTaskManager): GameState {
    const gameState: GameState = {
      subPKPId: subPKP.id,
      currentLevel: 1,
      experience: 0,
      nextLevelExperience: 100,
      streak: 0,
      bestStreak: 0,
      totalPoints: 0,
      achievements: [],
      activeChallenges: this.generateInitialChallenges(subPKP),
      completedChallenges: [],
      skills: this.initializeSkills(subPKP.purpose),
      rank: 0,
      percentile: 0,
    };

    this.gameStates.set(subPKP.id, gameState);
    this.logger.log(`🎮 Initialized game state for ${subPKP.name}`);

    return gameState;
  }

  /**
   * Handle task completion
   */
  private handleTaskCompletion(event: {
    subPKPId: string;
    success: boolean;
    duration: number;
    quality: number;
    taskType: string;
  }): void {
    const gameState = this.gameStates.get(event.subPKPId);
    if (!gameState) return;

    // Calculate points
    let points = 0;
    if (event.success) {
      // Base points
      points = 10;

      // Quality bonus
      points += Math.floor(event.quality / 10);

      // Speed bonus (if faster than average)
      if (event.duration < 3600) {
        points += 5;
      }

      // Streak bonus
      gameState.streak++;
      if (gameState.streak > gameState.bestStreak) {
        gameState.bestStreak = gameState.streak;
      }
      points += Math.min(gameState.streak, 10);

      // Update experience
      gameState.experience += points;
      gameState.totalPoints += points;

      this.logger.log(
        `🎯 ${event.subPKPId} earned ${points} points (streak: ${gameState.streak})`,
      );
    } else {
      // Reset streak on failure
      gameState.streak = 0;
    }

    // Check for level up
    if (gameState.experience >= gameState.nextLevelExperience) {
      this.levelUp(gameState);
    }

    // Update skill experience
    this.updateSkillExperience(gameState, event.taskType, points);

    // Check challenge progress
    this.updateChallengeProgress(gameState, event);

    // Update leaderboard
    this.updateLeaderboard(event.subPKPId, gameState.totalPoints);
  }

  /**
   * Level up
   */
  private levelUp(gameState: GameState): void {
    gameState.currentLevel++;
    gameState.experience -= gameState.nextLevelExperience;
    gameState.nextLevelExperience = Math.floor(
      gameState.nextLevelExperience * 1.5,
    );

    this.logger.log(
      `🎉 ${gameState.subPKPId} leveled up to ${gameState.currentLevel}!`,
    );

    // Grant achievement
    this.unlockAchievement(gameState, {
      id: `level_${gameState.currentLevel}`,
      name: `Level ${gameState.currentLevel}`,
      description: `Reached level ${gameState.currentLevel}`,
      icon: '🌟',
      unlockedAt: new Date(),
      rarity: this.getLevelRarity(gameState.currentLevel),
      reward: {
        experience: 50,
        autonomyBoost: 5,
      },
    });

    // Emit level up event
    this.eventEmitter.emit('game.levelup', {
      subPKPId: gameState.subPKPId,
      level: gameState.currentLevel,
      timestamp: new Date(),
    });
  }

  /**
   * Handle learning event
   */
  private handleLearning(event: {
    subPKPId: string;
    insight: string;
    improvement: number;
  }): void {
    const gameState = this.gameStates.get(event.subPKPId);
    if (!gameState) return;

    // Award learning points
    const points = Math.floor(event.improvement * 2);
    gameState.experience += points;
    gameState.totalPoints += points;

    this.logger.log(
      `🧠 ${event.subPKPId} learned: ${event.insight} (+${points} XP)`,
    );

    // Check for learning achievement
    if (!gameState.achievements.find((a) => a.id === 'first_learning')) {
      this.unlockAchievement(gameState, {
        id: 'first_learning',
        name: 'Quick Learner',
        description: 'First time learning from experience',
        icon: '📚',
        unlockedAt: new Date(),
        rarity: 'common',
        reward: {
          experience: 25,
        },
      });
    }
  }

  /**
   * Handle innovation event
   */
  private handleInnovation(event: {
    subPKPId: string;
    innovation: string;
    impact: number;
  }): void {
    const gameState = this.gameStates.get(event.subPKPId);
    if (!gameState) return;

    // Award innovation points (higher reward)
    const points = Math.floor(event.impact * 5);
    gameState.experience += points;
    gameState.totalPoints += points;

    this.logger.log(
      `💡 ${event.subPKPId} innovated: ${event.innovation} (+${points} XP)`,
    );

    // Unlock innovation achievement
    this.unlockAchievement(gameState, {
      id: `innovation_${Date.now()}`,
      name: 'Innovator',
      description: event.innovation,
      icon: '💡',
      unlockedAt: new Date(),
      rarity: event.impact > 50 ? 'epic' : 'rare',
      reward: {
        experience: 100,
        capabilityUnlock: 'advanced-problem-solving',
      },
    });
  }

  /**
   * Unlock achievement
   */
  private unlockAchievement(
    gameState: GameState,
    achievement: Achievement,
  ): void {
    gameState.achievements.push(achievement);
    gameState.experience += achievement.reward.experience;

    this.logger.log(
      `🏆 ${gameState.subPKPId} unlocked achievement: ${achievement.name}`,
    );

    // Emit achievement event
    this.eventEmitter.emit('achievement.unlocked', {
      subPKPId: gameState.subPKPId,
      achievement,
      timestamp: new Date(),
    });
  }

  /**
   * Update skill experience
   */
  private updateSkillExperience(
    gameState: GameState,
    taskType: string,
    points: number,
  ): void {
    const skill = gameState.skills[taskType];
    if (!skill) return;

    skill.experience += points;

    // Check for skill level up
    if (skill.experience >= skill.nextLevelExperience) {
      skill.level++;
      skill.experience -= skill.nextLevelExperience;
      skill.nextLevelExperience = Math.floor(skill.nextLevelExperience * 1.3);

      this.logger.log(
        `⚡ ${gameState.subPKPId} skill leveled up: ${skill.name} → ${skill.level}`,
      );

      // Emit skill level up event
      this.eventEmitter.emit('skill.levelup', {
        subPKPId: gameState.subPKPId,
        skill: skill.name,
        level: skill.level,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update challenge progress
   */
  private updateChallengeProgress(
    gameState: GameState,
    event: {
      subPKPId: string;
      success: boolean;
      quality: number;
    },
  ): void {
    for (const challenge of gameState.activeChallenges) {
      if (event.success) {
        challenge.progress.tasksCompleted++;
      }

      // Update moving averages
      const alpha = 0.2;
      challenge.progress.currentSuccessRate =
        challenge.progress.currentSuccessRate * (1 - alpha) +
        (event.success ? 100 : 0) * alpha;
      challenge.progress.currentQuality =
        challenge.progress.currentQuality * (1 - alpha) + event.quality * alpha;

      // Check if challenge completed
      if (
        challenge.progress.tasksCompleted >=
          challenge.requirements.tasksToComplete &&
        challenge.progress.currentSuccessRate >=
          challenge.requirements.targetSuccessRate &&
        challenge.progress.currentQuality >=
          challenge.requirements.targetQuality
      ) {
        this.completeChallenge(gameState, challenge);
      }
    }
  }

  /**
   * Complete challenge
   */
  private completeChallenge(gameState: GameState, challenge: Challenge): void {
    // Remove from active challenges
    gameState.activeChallenges = gameState.activeChallenges.filter(
      (c) => c.id !== challenge.id,
    );
    gameState.completedChallenges.push(challenge.id);

    // Award rewards
    gameState.experience += challenge.reward.experience;
    gameState.totalPoints += challenge.reward.points;

    this.logger.log(
      `🎖️ ${gameState.subPKPId} completed challenge: ${challenge.name}`,
    );

    // Unlock achievement if specified
    if (challenge.reward.achievement) {
      const achievement = this.getAchievementById(challenge.reward.achievement);
      if (achievement) {
        this.unlockAchievement(gameState, achievement);
      }
    }

    // Generate new challenge
    gameState.activeChallenges.push(this.generateChallenge(gameState));

    // Emit challenge completion event
    this.eventEmitter.emit('challenge.completed', {
      subPKPId: gameState.subPKPId,
      challenge,
      timestamp: new Date(),
    });
  }

  /**
   * Update leaderboard
   */
  private updateLeaderboard(subPKPId: string, points: number): void {
    // Update or add entry
    const entry = this.leaderboard.find((e) => e.subPKPId === subPKPId);
    if (entry) {
      entry.points = points;
    } else {
      this.leaderboard.push({ subPKPId, points, rank: 0 });
    }

    // Sort by points (descending)
    this.leaderboard.sort((a, b) => b.points - a.points);

    // Update ranks
    this.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;

      const gameState = this.gameStates.get(entry.subPKPId);
      if (gameState) {
        gameState.rank = entry.rank;
        gameState.percentile = Math.floor(
          (1 - index / this.leaderboard.length) * 100,
        );
      }
    });
  }

  /**
   * Get game state
   */
  getGameState(subPKPId: string): GameState | undefined {
    return this.gameStates.get(subPKPId);
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(
    limit: number = 10,
  ): Array<{ subPKPId: string; points: number; rank: number }> {
    return this.leaderboard.slice(0, limit);
  }

  // Helper methods

  private initializeSkills(
    purpose: SubPKPTaskManager['purpose'],
  ): Record<string, SkillLevel> {
    const baseSkills: Record<string, SkillLevel> = {
      'task-completion': {
        name: 'Task Completion',
        level: 1,
        experience: 0,
        nextLevelExperience: 50,
        bonuses: ['Faster task execution'],
      },
      'quality-assurance': {
        name: 'Quality Assurance',
        level: 1,
        experience: 0,
        nextLevelExperience: 50,
        bonuses: ['Higher code quality'],
      },
      'problem-solving': {
        name: 'Problem Solving',
        level: 1,
        experience: 0,
        nextLevelExperience: 50,
        bonuses: ['Better error handling'],
      },
    };

    // Add purpose-specific skills
    if (purpose === 'development') {
      baseSkills['code-generation'] = {
        name: 'Code Generation',
        level: 1,
        experience: 0,
        nextLevelExperience: 50,
        bonuses: ['Cleaner code'],
      };
    }

    return baseSkills;
  }

  private generateInitialChallenges(subPKP: SubPKPTaskManager): Challenge[] {
    return [
      {
        id: 'first_10_tasks',
        name: 'First Steps',
        description: 'Complete your first 10 tasks successfully',
        type: 'speed',
        difficulty: 'easy',
        requirements: {
          tasksToComplete: 10,
          targetSuccessRate: 80,
          targetQuality: 70,
        },
        progress: {
          tasksCompleted: 0,
          currentSuccessRate: 0,
          currentQuality: 0,
        },
        reward: {
          experience: 100,
          points: 50,
          achievement: 'first_steps',
        },
      },
    ];
  }

  private generateChallenge(gameState: GameState): Challenge {
    const challenges: Challenge[] = [
      {
        id: `speed_${Date.now()}`,
        name: 'Speed Demon',
        description: 'Complete 20 tasks with high quality in record time',
        type: 'speed',
        difficulty: 'medium',
        requirements: {
          tasksToComplete: 20,
          targetSuccessRate: 90,
          targetQuality: 80,
          timeLimit: 7200,
        },
        progress: {
          tasksCompleted: 0,
          currentSuccessRate: 0,
          currentQuality: 0,
        },
        reward: {
          experience: 200,
          points: 100,
        },
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
      },
    ];

    return challenges[0];
  }

  private getLevelRarity(level: number): Achievement['rarity'] {
    if (level >= 50) return 'legendary';
    if (level >= 25) return 'epic';
    if (level >= 10) return 'rare';
    return 'common';
  }

  private getAchievementById(id: string): Achievement | null {
    const achievements: Record<string, Achievement> = {
      first_steps: {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Completed first 10 tasks',
        icon: '👣',
        unlockedAt: new Date(),
        rarity: 'common',
        reward: {
          experience: 50,
        },
      },
    };

    return achievements[id] || null;
  }
}
