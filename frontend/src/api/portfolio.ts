import { ApiError, apiGet, USE_MOCKS } from './client';
import { mockDb } from './mockDb';
import type { Experience, Profile, ProjectDetail, ProjectRecord, ProjectSummary, StackGroup } from './types';

/**
 * Публичные данные сайта. Компоненты зовут только эти функции.
 * Чтобы подключить FastAPI, достаточно поставить VITE_USE_MOCKS=false
 * и реализовать на бэкенде эндпоинты из правой части каждого вызова.
 */

const fromMock = <T>(data: T): Promise<T> => Promise.resolve(data);

export const toSummary = ({ detail, ...rest }: ProjectRecord): ProjectSummary => ({
  ...rest,
  hasDetail: detail !== null,
});

export const portfolioApi = {
  getProfile: (signal?: AbortSignal) =>
    USE_MOCKS ? fromMock(mockDb.read().profile) : apiGet<Profile>('/api/profile', signal),

  getProjects: (signal?: AbortSignal) =>
    USE_MOCKS
      ? fromMock(mockDb.read().projects.map(toSummary))
      : apiGet<ProjectSummary[]>('/api/projects', signal),

  getProjectDetail: (slug: string, signal?: AbortSignal): Promise<ProjectDetail> => {
    if (USE_MOCKS) {
      const record = mockDb.read().projects.find((p) => p.slug === slug);
      return record?.detail
        ? fromMock({ ...toSummary(record), ...record.detail })
        : Promise.reject(new ApiError('Project not found', 404));
    }
    return apiGet<ProjectDetail>(`/api/projects/${encodeURIComponent(slug)}`, signal);
  },

  getStack: (signal?: AbortSignal) =>
    USE_MOCKS ? fromMock(mockDb.read().stack) : apiGet<StackGroup[]>('/api/stack', signal),

  getExperience: (signal?: AbortSignal) =>
    USE_MOCKS ? fromMock(mockDb.read().experience) : apiGet<Experience[]>('/api/experience', signal),
};
