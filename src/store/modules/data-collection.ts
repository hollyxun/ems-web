import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  fetchApproveManualEntry,
  fetchCreateManualEntry,
  fetchCreateValidationRule,
  fetchDeleteManualEntry,
  fetchDeleteValidationRule,
  fetchGetEntryAuditLog,
  fetchGetManualEntryList,
  fetchGetPendingApprovals,
  fetchGetValidationRules,
  fetchRejectManualEntry,
  fetchSubmitManualEntry,
  fetchUpdateManualEntry,
  fetchUpdateValidationRule
} from '@/service/api/data-collection';

export const useDataCollectionStore = defineStore('data-collection', () => {
  // State
  const entryList = ref<Api.DataCollection.ManualEntry[]>([]);
  const pendingApprovals = ref<Api.DataCollection.ManualEntry[]>([]);
  const currentEntry = ref<Api.DataCollection.ManualEntry | null>(null);
  const auditLog = ref<Api.DataCollection.EntryAuditLog[]>([]);
  const validationRules = ref<Api.DataCollection.ValidationRule[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const pendingTotal = ref(0);

  // Getters
  const hasPendingApprovals = computed(() => pendingTotal.value > 0);
  const draftEntries = computed(() =>
    entryList.value.filter((e: Api.DataCollection.ManualEntry) => e.status === 'draft')
  );

  // Actions - Manual Entry
  async function getEntryList(params: Api.DataCollection.ManualEntryQuery) {
    loading.value = true;
    try {
      const { data } = await fetchGetManualEntryList(params);
      if (data) {
        entryList.value = data.list;
        total.value = data.total;
      }
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function getPendingApprovalsList(page = 1, pageSize = 20) {
    loading.value = true;
    try {
      const { data } = await fetchGetPendingApprovals(page, pageSize);
      if (data) {
        pendingApprovals.value = data.list;
        pendingTotal.value = data.total;
      }
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function createEntry(data: Api.DataCollection.ManualEntryCreate) {
    return fetchCreateManualEntry(data);
  }

  async function updateEntry(data: Api.DataCollection.ManualEntryUpdate) {
    return fetchUpdateManualEntry(data);
  }

  async function submitEntry(id: number) {
    return fetchSubmitManualEntry(id);
  }

  async function approveEntry(data: Api.DataCollection.ApprovalRequest) {
    return fetchApproveManualEntry(data);
  }

  async function rejectEntry(data: Api.DataCollection.ApprovalRequest) {
    return fetchRejectManualEntry(data);
  }

  async function deleteEntry(id: number) {
    return fetchDeleteManualEntry(id);
  }

  async function getAuditLog(entryId: number) {
    const { data } = await fetchGetEntryAuditLog(entryId);
    auditLog.value = data || [];
    return data;
  }

  // Actions - Validation Rules
  async function getValidationRules(meterId?: number, energyMedium?: string) {
    const { data } = await fetchGetValidationRules(meterId, energyMedium);
    validationRules.value = data || [];
    return data;
  }

  async function createValidationRule(data: Api.DataCollection.ValidationRuleRequest) {
    return fetchCreateValidationRule(data);
  }

  async function updateValidationRule(data: Api.DataCollection.ValidationRuleRequest) {
    return fetchUpdateValidationRule(data);
  }

  async function deleteValidationRule(id: number) {
    return fetchDeleteValidationRule(id);
  }

  function reset() {
    entryList.value = [];
    pendingApprovals.value = [];
    currentEntry.value = null;
    auditLog.value = [];
    validationRules.value = [];
    total.value = 0;
    pendingTotal.value = 0;
  }

  return {
    // State
    entryList,
    pendingApprovals,
    currentEntry,
    auditLog,
    validationRules,
    loading,
    total,
    pendingTotal,
    // Getters
    hasPendingApprovals,
    draftEntries,
    // Actions
    getEntryList,
    getPendingApprovalsList,
    createEntry,
    updateEntry,
    submitEntry,
    approveEntry,
    rejectEntry,
    deleteEntry,
    getAuditLog,
    getValidationRules,
    createValidationRule,
    updateValidationRule,
    deleteValidationRule,
    reset
  };
});
