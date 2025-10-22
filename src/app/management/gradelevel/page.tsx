"use client";
import React from "react";
import { useGradeLevelData } from "../../_hooks/gradeLevelData";
import GradeLevelTable from "@/app/management/gradelevel/component/GradeLevelTable";
import { TableSkeleton, NoDataEmptyState, NetworkErrorEmptyState } from "@/components/feedback";

type Props = {};

function GradeLevelManage(props: Props) {
  const { data, isLoading, error, mutate } = useGradeLevelData();

  if (isLoading) {
    return <TableSkeleton rows={6} />;
  }

  if (error) {
    return <NetworkErrorEmptyState onRetry={() => mutate()} />;
  }

  if (!data || data.length === 0) {
    return <NoDataEmptyState />;
  }

  return (
    <GradeLevelTable
      tableHead={["รหัสชั้นเรียน", "มัธยมปีที่", "ห้องที่", "หลักสูตร", ""]}
      tableData={data}
      mutate={mutate}
    />
  );
}

export default GradeLevelManage;