import { ApiError, apiGet, USE_MOCKS } from './client';
import * as mocks from './mocks';
import type { Experience, Profile, ProjectDetail, ProjectSummary, StackGroup } from './types';

/**
 * Единая точка доступа к данным. Компоненты зовут только эти функции.
 * Чтобы подключить FastAPI, достаточно поставить VITE_USE_MOCKS=false
 * и реализовать на бэкенде эндпоинты из правой части каждого вызова.
 */

const fromMock = <T>(data: T): Promise<T> => Promise.resolve(data);

export const portfolioApi = {
  getProfile: (signal?: AbortSignal) =>
    USE_MOCKS ? fromMock(mocks.profile) : apiGet<Profile>('/api/profile', signal),

  getProjects: (signal?: AbortSignal) =>
    USE_MOCKS ? fromMock(mocks.projects) : apiGet<ProjectSummary[]>('/api/projects', signal),

  getProjectDetail: (slug: string, signal?: AbortSignal): Promise<ProjectDetail> => {
    if (USE_MOCKS) {
      const detail = mocks.projectDetails.find((p) => p.slug === slug);
      return detail ? fromMock(detail) : Promise.reject(new ApiError('Project not found', 404));
    }
    return apiGet<ProjectDetail>(`/api/projects/${encodeURIComponent(slug)}`, signal);
  },

  getStack: (signal?: AbortSignal) =>
    USE_MOCKS ? fromMock(mocks.stack) : apiGet<StackGroup[]>('/api/stack', signal),

  getExperience: (signal?: AbortSignal) =>
    USE_MOCKS ? fromMock(mocks.experience) : apiGet<Experience[]>('/api/experience', signal),
};
