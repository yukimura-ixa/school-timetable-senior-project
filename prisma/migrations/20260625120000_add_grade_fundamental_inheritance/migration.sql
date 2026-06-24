-- CreateTable
CREATE TABLE "grade_fundamental" (
    "GradeFundamentalID" SERIAL NOT NULL,
    "Year" INTEGER NOT NULL,
    "SubjectCode" TEXT NOT NULL,
    "MinCredits" DOUBLE PRECISION NOT NULL,
    "MaxCredits" DOUBLE PRECISION,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "grade_fundamental_pkey" PRIMARY KEY ("GradeFundamentalID")
);

-- CreateTable
CREATE TABLE "program_fundamental_override" (
    "ProgramFundamentalOverrideID" SERIAL NOT NULL,
    "ProgramID" INTEGER NOT NULL,
    "SubjectCode" TEXT NOT NULL,
    "Excluded" BOOLEAN NOT NULL DEFAULT false,
    "MinCredits" DOUBLE PRECISION,
    "MaxCredits" DOUBLE PRECISION,

    CONSTRAINT "program_fundamental_override_pkey" PRIMARY KEY ("ProgramFundamentalOverrideID")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_fundamental_year_subject_unique" ON "grade_fundamental"("Year", "SubjectCode");

-- CreateIndex
CREATE INDEX "grade_fundamental_Year_idx" ON "grade_fundamental"("Year");

-- CreateIndex
CREATE UNIQUE INDEX "program_fundamental_override_unique" ON "program_fundamental_override"("ProgramID", "SubjectCode");

-- CreateIndex
CREATE INDEX "program_fundamental_override_ProgramID_idx" ON "program_fundamental_override"("ProgramID");

-- AddForeignKey
ALTER TABLE "grade_fundamental" ADD CONSTRAINT "fk_grade_fundamental_subject" FOREIGN KEY ("SubjectCode") REFERENCES "subject"("SubjectCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_fundamental_override" ADD CONSTRAINT "fk_pfo_program" FOREIGN KEY ("ProgramID") REFERENCES "program"("ProgramID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_fundamental_override" ADD CONSTRAINT "fk_pfo_subject" FOREIGN KEY ("SubjectCode") REFERENCES "subject"("SubjectCode") ON DELETE CASCADE ON UPDATE CASCADE;
