/**
 * NPE Controller
 * 
 * REST API endpoints for NPE team management and reporting
 */

import { Controller, Get } from '@nestjs/common';
import { LitComputeTeamService } from './lit-compute-team.service';
import {
  NPETeam,
  Goal,
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  GoodFaithMetrics,
  DashboardData,
} from './npe-team.types';

@Controller('npe')
export class NPEController {
  constructor(private readonly teamService: LitComputeTeamService) {}

  /**
   * Get team information
   * GET /npe/team
   */
  @Get('team')
  getTeam(): NPETeam {
    return this.teamService.getTeam();
  }

  /**
   * Get all goals
   * GET /npe/goals
   */
  @Get('goals')
  getGoals(): Goal[] {
    return this.teamService.getGoals();
  }

  /**
   * Get daily report
   * GET /npe/reports/daily
   */
  @Get('reports/daily')
  async getDailyReport(): Promise<DailyReport> {
    return this.teamService.generateDailyReport();
  }

  /**
   * Get weekly report
   * GET /npe/reports/weekly
   */
  @Get('reports/weekly')
  async getWeeklyReport(): Promise<WeeklyReport> {
    return this.teamService.generateWeeklyReport();
  }

  /**
   * Get monthly report
   * GET /npe/reports/monthly
   */
  @Get('reports/monthly')
  async getMonthlyReport(): Promise<MonthlyReport> {
    return this.teamService.generateMonthlyReport();
  }

  /**
   * Get Good Faith metrics
   * GET /npe/metrics/goodfaith
   */
  @Get('metrics/goodfaith')
  getGoodFaithMetrics(): GoodFaithMetrics {
    return this.teamService.calculateGoodFaithMetrics();
  }

  /**
   * Get dashboard data
   * GET /npe/dashboard
   */
  @Get('dashboard')
  async getDashboard(): Promise<DashboardData> {
    return this.teamService.getDashboardData();
  }
}
