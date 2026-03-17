/**
 * 命名空间 Api.DataOverview
 *
 * 后端 API 模块：数据概览
 */
declare namespace Api {
  namespace DataOverview {
    type ProjectStatusSummary = {
      failedProjects: number;
      pendingProjects: number;
      runningProjects: number;
      successProjects: number;
      totalProjects: number;
    };

    type ProjectStatusFileStats = {
      draftFiles: number;
      failedFiles: number;
      nonDraftFiles: number;
      partialFailedFiles: number;
      pendingFiles: number;
      runningFiles: number;
      step3SuccessFiles: number;
      successFiles: number;
      totalFiles: number;
    };

    type ProjectStatusDetail = {
      currentStepName: string;
      currentStepNo: number;
      fileStats: ProjectStatusFileStats;
      lastError: string | null;
      latestTaskStatus: string | null;
      latestTaskStepNo: number | null;
      latestTaskUpdatedAt: string | null;
      projectId: string;
      projectName: string;
      status: string;
      statusLabel: string;
    };

    type RankingCategory = 'abnormal' | 'completed' | 'remaining' | 'running';

    type ProjectStatusRankingParams = {
      category?: RankingCategory;
      endTime?: string;
      limit?: number;
      startTime?: string;
    };

    type ProjectStatusRankingRecord = {
      completeTime: string | null;
      name: string;
      projectId: string;
      rank: number;
      status: string;
    };

    type ProjectStatusRankingResult = {
      category: RankingCategory;
      records: ProjectStatusRankingRecord[];
      total: number;
    };
  }
}
