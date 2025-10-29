/**
 * Presentation Layer: Grade Level Tabs Component
 * 
 * MUI v7 tabs for switching between teacher arrange view and 
 * grade level views (ม.1-ม.6).
 * 
 * @module GradeLevelTabs
 */

'use client';

import React from 'react';
import { Tabs, Tab, Box, Badge } from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  ARRANGE_TABS,
  TAB_LABELS,
  type ArrangeTab,
} from '@/features/schedule-arrangement/domain/constants';

interface GradeLevelTabsProps {
  /** Current active tab */
  currentTab: ArrangeTab;
  
  /** Handler for tab change */
  onTabChange: (tab: ArrangeTab) => void;
  
  /** Optional: Show badge with count of assigned classes per grade */
  gradeCounts?: Record<number, number>;
}

/**
 * Tabs for navigating between teacher and grade level views
 */
export function GradeLevelTabs({
  currentTab,
  onTabChange,
  gradeCounts,
}: GradeLevelTabsProps) {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue as ArrangeTab);
  };

  const getGradeCount = (gradeLevel: number): number => {
    return gradeCounts?.[gradeLevel] || 0;
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        aria-label="arrange tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minWidth: 100,
            fontWeight: 'medium',
          },
        }}
      >
        {/* Teacher Arrange Tab */}
        <Tab
          value={ARRANGE_TABS.TEACHER}
          label={TAB_LABELS[ARRANGE_TABS.TEACHER]}
          icon={<PersonIcon />}
          iconPosition="start"
          sx={{
            '&.Mui-selected': {
              bgcolor: 'primary.50',
            },
          }}
        />

        {/* Grade Level Tabs */}
        {[
          { tab: ARRANGE_TABS.GRADE_1, level: 7 },
          { tab: ARRANGE_TABS.GRADE_2, level: 8 },
          { tab: ARRANGE_TABS.GRADE_3, level: 9 },
          { tab: ARRANGE_TABS.GRADE_4, level: 10 },
          { tab: ARRANGE_TABS.GRADE_5, level: 11 },
          { tab: ARRANGE_TABS.GRADE_6, level: 12 },
        ].map(({ tab, level }) => {
          const count = getGradeCount(level);
          return (
            <Tab
              key={tab}
              value={tab}
              label={
                <Badge
                  badgeContent={count > 0 ? count : undefined}
                  color="primary"
                  max={99}
                >
                  <span style={{ paddingRight: count > 0 ? '12px' : '0' }}>
                    {TAB_LABELS[tab]}
                  </span>
                </Badge>
              }
              icon={<SchoolIcon />}
              iconPosition="start"
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'success.50',
                },
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}
