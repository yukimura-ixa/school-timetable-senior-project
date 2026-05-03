import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/prisma/generated/client";

export const breakGroupRepository = {
  async findByConfigId(configId: string) {
    return prisma.break_group.findMany({
      where: { ConfigID: configId },
      include: { grades: true },
      orderBy: { BreakGroupID: "asc" },
    });
  },

  async createWithGrades(
    data: { Name: string; Label: string; Color: string; ConfigID: string; gradeIds: string[] },
    tx?: PrismaClient,
  ) {
    const client = tx ?? prisma;
    return client.break_group.create({
      data: {
        Name: data.Name,
        Label: data.Label,
        Color: data.Color,
        ConfigID: data.ConfigID,
        grades: {
          create: data.gradeIds.map(gid => ({ GradeID: gid })),
        },
      },
      include: { grades: true },
    });
  },

  async deleteByConfigId(configId: string, tx?: PrismaClient) {
    const client = tx ?? prisma;
    return client.break_group.deleteMany({ where: { ConfigID: configId } });
  },
};
