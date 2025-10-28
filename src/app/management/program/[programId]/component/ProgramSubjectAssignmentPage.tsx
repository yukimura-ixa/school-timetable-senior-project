"use client";

import React, { useState, useEffect } from "react";
import { assignSubjectsToProgramAction, getProgramByIdAction } from "@/features/program/application/actions/program.actions";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import { SubjectCategory } from "@/prisma/generated";
import { 
  Checkbox, 
  Button, 
  CircularProgress, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Switch
} from "@mui/material";

type Subject = {
  SubjectCode: string;
  SubjectName: string;
  Category: SubjectCategory;
  Credit: string;
};

type ProgramSubject = {
  SubjectCode: string;
  MinCredits?: number;
  MaxCredits?: number;
  IsMandatory?: boolean;
};

type Program = {
  ProgramID: number;
  ProgramName: string;
  program_subject: ProgramSubject[];
};

type MoeValidation = {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
};

type SubjectConfig = {
  SubjectCode: string;
  selected: boolean;
  minCredits: number;
  maxCredits: number;
  isMandatory: boolean;
};

export default function ProgramSubjectAssignmentPage({ programId }: { programId: number }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectConfigs, setSubjectConfigs] = useState<Record<string, SubjectConfig>>({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [validation, setValidation] = useState<MoeValidation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const progRes = await getProgramByIdAction({ ProgramID: programId });
      const subjRes = await getSubjectsAction();
      
      if (subjRes.success && subjRes.data) {
        setSubjects(subjRes.data as Subject[]);
        
        // Initialize configs
        const configs: Record<string, SubjectConfig> = {};
        (subjRes.data as Subject[]).forEach((s) => {
          const existing = progRes.data?.program_subject?.find((ps: ProgramSubject) => ps.SubjectCode === s.SubjectCode);
          configs[s.SubjectCode] = {
            SubjectCode: s.SubjectCode,
            selected: !!existing,
            minCredits: existing?.MinCredits ?? 1,
            maxCredits: existing?.MaxCredits ?? 1,
            isMandatory: existing?.IsMandatory ?? (s.Category === SubjectCategory.CORE),
          };
        });
        setSubjectConfigs(configs);
      }
      
      if (progRes.success && progRes.data) {
        setProgram(progRes.data as Program);
      }
      
      setLoading(false);
    };
    void fetchData();
  }, [programId]);

  const handleToggle = (code: string) => {
    setSubjectConfigs((prev) => ({
      ...prev,
      [code]: { ...prev[code], selected: !prev[code].selected },
    }));
  };

  const handleConfigChange = (code: string, field: 'minCredits' | 'maxCredits' | 'isMandatory', value: number | boolean) => {
    setSubjectConfigs((prev) => ({
      ...prev,
      [code]: { ...prev[code], [field]: value },
    }));
  };

  const handleAssign = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAssigning(true);
    
    const selectedSubjects = Object.values(subjectConfigs)
      .filter((config) => config.selected)
      .map((config, i) => ({
        SubjectCode: config.SubjectCode,
        Category: subjects.find((s) => s.SubjectCode === config.SubjectCode)?.Category ?? SubjectCategory.CORE,
        IsMandatory: config.isMandatory,
        MinCredits: config.minCredits,
        MaxCredits: config.maxCredits,
        SortOrder: i + 1,
      }));
    
    const payload = {
      ProgramID: programId,
      subjects: selectedSubjects,
    };
    
    assignSubjectsToProgramAction(payload)
      .then((result) => {
        if (result.success && result.data) {
          setValidation(result.data.moeValidation as MoeValidation);
          setProgram(result.data.program as Program);
        }
        setAssigning(false);
      })
      .catch(() => {
        setAssigning(false);
      });
  };

  const selectedCount = Object.values(subjectConfigs).filter((c) => c.selected).length;

  if (loading) return <CircularProgress />;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
      <Typography variant="h5" gutterBottom>
        Assign Subjects to Program: {program?.ProgramName ?? ""}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Selected: {selectedCount} subjects
      </Typography>

      <TableContainer component={Paper} style={{ marginTop: 16 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Select</TableCell>
              <TableCell>Subject Code</TableCell>
              <TableCell>Subject Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Min Credits</TableCell>
              <TableCell align="center">Max Credits</TableCell>
              <TableCell align="center">Mandatory</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject) => {
              const config = subjectConfigs[subject.SubjectCode];
              if (!config) return null;
              
              return (
                <TableRow 
                  key={subject.SubjectCode}
                  sx={{ 
                    backgroundColor: config.selected ? 'action.selected' : 'inherit',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={config.selected}
                      onChange={() => handleToggle(subject.SubjectCode)}
                    />
                  </TableCell>
                  <TableCell>{subject.SubjectCode}</TableCell>
                  <TableCell>{subject.SubjectName}</TableCell>
                  <TableCell>{subject.Category}</TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={config.minCredits}
                      onChange={(e) => handleConfigChange(subject.SubjectCode, 'minCredits', parseFloat(e.target.value) || 0)}
                      disabled={!config.selected}
                      inputProps={{ min: 0, max: 10, step: 0.5, style: { width: 60, textAlign: 'center' } }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={config.maxCredits}
                      onChange={(e) => handleConfigChange(subject.SubjectCode, 'maxCredits', parseFloat(e.target.value) || 0)}
                      disabled={!config.selected}
                      inputProps={{ min: 0, max: 10, step: 0.5, style: { width: 60, textAlign: 'center' } }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={config.isMandatory}
                      onChange={(e) => handleConfigChange(subject.SubjectCode, 'isMandatory', e.target.checked)}
                      disabled={!config.selected}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleAssign} 
        disabled={assigning || selectedCount === 0}
        style={{ marginTop: 24 }}
      >
        {assigning ? 'Assigning...' : `Assign ${selectedCount} Selected Subjects`}
      </Button>

      {validation && (
        <div style={{ marginTop: 24 }}>
          <Typography variant="h6">MOE Validation</Typography>
          {validation.isValid ? (
            <Typography color="success.main">✓ Compliant with MOE requirements.</Typography>
          ) : (
            <Typography color="error.main">✗ Not compliant:</Typography>
          )}
          {validation.errors && validation.errors.length > 0 && (
            <ul style={{ color: 'red' }}>
              {validation.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}
          {validation.warnings && validation.warnings.length > 0 && (
            <ul style={{ color: 'orange' }}>
              {validation.warnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
