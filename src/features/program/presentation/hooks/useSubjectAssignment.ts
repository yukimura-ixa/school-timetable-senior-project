/**
 * Custom hook for managing subject assignment logic and state
 * 
 * Features:
 * - Subject configuration state management
 * - Assignment mutations with optimistic updates
 * - MOE validation tracking
 * - Memoized calculations (selectedCount, totalCredits)
 */

import { useState, useCallback, useMemo } from 'react'
import { useSnackbar } from 'notistack'
import { SubjectCategory } from '@/models/subject-category'
import { assignSubjectsToProgramAction } from '../../application/actions/program.actions'
import type { Subject, Program } from './useProgramSubjects'

export type SubjectConfig = {
  SubjectCode: string
  selected: boolean
  minCredits: number
  maxCredits: number
  isMandatory: boolean
}

export type MoeValidation = {
  isValid: boolean
  errors?: string[]
  warnings?: string[]
}

/**
 * Manages subject assignment configuration and mutations
 * @param programId - Program ID for assignments
 * @param subjects - List of available subjects
 * @param program - Current program data
 * @param onSuccess - Callback when assignment succeeds
 * @returns Assignment state, handlers, and computed values
 */
export function useSubjectAssignment(
  programId: number,
  subjects: Subject[],
  program: Program | null,
  onSuccess?: (program: Program, validation: MoeValidation) => void
) {
  const { enqueueSnackbar } = useSnackbar()

  // Initialize subject configs from existing assignments
  const initialConfigs = useMemo(() => {
    const configs: Record<string, SubjectConfig> = {}

    subjects.forEach((s) => {
      const existing = program?.program_subject?.find((ps) => ps.SubjectCode === s.SubjectCode)
      configs[s.SubjectCode] = {
        SubjectCode: s.SubjectCode,
        selected: !!existing,
        minCredits: existing?.MinCredits ?? 1,
        maxCredits: existing?.MaxCredits ?? 1,
        isMandatory: existing?.IsMandatory ?? (s.Category === SubjectCategory.CORE),
      }
    })

    return configs
  }, [subjects, program])

  const [subjectConfigs, setSubjectConfigs] = useState<Record<string, SubjectConfig>>(initialConfigs)
  const [assigning, setAssigning] = useState(false)
  const [validation, setValidation] = useState<MoeValidation | null>(null)

  // Memoized selected count
  const selectedCount = useMemo(
    () => Object.values(subjectConfigs).filter((c) => c.selected).length,
    [subjectConfigs]
  )

  // Memoized total credits
  const totalCredits = useMemo(
    () =>
      Object.values(subjectConfigs)
        .filter((c) => c.selected)
        .reduce((sum, c) => sum + c.minCredits, 0),
    [subjectConfigs]
  )

  // Toggle subject selection
  const handleToggle = useCallback((code: string) => {
    setSubjectConfigs((prev) => {
      const existing = prev[code]
      if (!existing) return prev
      return {
        ...prev,
        [code]: { ...existing, selected: !existing.selected },
      }
    })
  }, [])

  // Update subject config field
  const handleConfigChange = useCallback(
    (code: string, field: 'minCredits' | 'maxCredits' | 'isMandatory', value: number | boolean) => {
      setSubjectConfigs((prev) => {
        const existing = prev[code]
        if (!existing) return prev
        return {
          ...prev,
          [code]: { ...existing, [field]: value },
        }
      })
    },
    []
  )

  // Assign subjects to program
  const handleAssign = useCallback(async () => {
    setAssigning(true)

    try {
      const selectedSubjects = Object.values(subjectConfigs)
        .filter((config) => config.selected)
        .map((config, i) => ({
          SubjectCode: config.SubjectCode,
          Category: subjects.find((s) => s.SubjectCode === config.SubjectCode)?.Category ?? SubjectCategory.CORE,
          IsMandatory: config.isMandatory,
          MinCredits: config.minCredits,
          MaxCredits: config.maxCredits,
          SortOrder: i + 1,
        }))

      const payload = {
        ProgramID: programId,
        subjects: selectedSubjects,
      }

      const result = await assignSubjectsToProgramAction(payload)

      if (result.success && result.data) {
        const moeValidation = result.data.moeValidation as MoeValidation
        const updatedProgram = result.data.program as Program

        setValidation(moeValidation)

        if (moeValidation.isValid) {
          enqueueSnackbar('บันทึกสำเร็จ: ผ่านมาตรฐาน กระทรวงศึกษาธิการ', { variant: 'success' })
        } else {
          enqueueSnackbar('บันทึกสำเร็จ แต่ไม่ผ่านมาตรฐาน กระทรวงศึกษาธิการ', { variant: 'warning' })
        }

        onSuccess?.(updatedProgram, moeValidation)
      } else {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'เกิดข้อผิดพลาดในการบันทึก'
        enqueueSnackbar(errorMessage, { variant: 'error' })
      }
    } catch (error) {
      enqueueSnackbar('เกิดข้อผิดพลาดในการบันทึก', { variant: 'error' })
      console.error('Assignment error:', error)
    } finally {
      setAssigning(false)
    }
  }, [subjectConfigs, programId, subjects, enqueueSnackbar, onSuccess])

  return {
    subjectConfigs,
    assigning,
    validation,
    selectedCount,
    totalCredits,
    handleToggle,
    handleConfigChange,
    handleAssign,
  }
}
