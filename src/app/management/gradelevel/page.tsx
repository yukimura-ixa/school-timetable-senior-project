"use client"
import React from 'react'
import { useGradeLevelData } from '../../_hooks/gradeLevelData';
import Loading from '@/app/loading';
import GradeLevelTable from '@/app/management/gradelevel/component/GradeLevelTable';

type Props = {}

function GradeLevelManage (props: Props) {
  const { data, isLoading, error, mutate } = useGradeLevelData();
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <GradeLevelTable
          tableHead={["รหัสชั้นเรียน", "มัธยมปีที่", "ห้องที่", "หลักสูตร", ""]}
          tableData={data}
          mutate={mutate} 
        />
      )}
    </>
  );
}
export default GradeLevelManage;