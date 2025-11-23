/**
 * Plain TypeScript enums for Client Components
 * These mirror Prisma enums but are safe to import in browser code
 */

export enum SubjectCategory {
    CORE = 'CORE',
    ADDITIONAL = 'ADDITIONAL',
    ACTIVITY = 'ACTIVITY',
}

export enum LearningArea {
    THAI = 'THAI',
    MATHEMATICS = 'MATHEMATICS',
    SCIENCE = 'SCIENCE',
    SOCIAL = 'SOCIAL',
    HEALTH_PE = 'HEALTH_PE',
    ARTS = 'ARTS',
    CAREER = 'CAREER',
    FOREIGN_LANGUAGE = 'FOREIGN_LANGUAGE',
}

export enum ActivityType {
    CLUB = 'CLUB',
    SCOUT = 'SCOUT',
    GUIDANCE = 'GUIDANCE',
    SOCIAL_SERVICE = 'SOCIAL_SERVICE',
}

export enum ProgramTrack {
    SCIENCE_MATH = 'SCIENCE_MATH',
    LANGUAGE_MATH = 'LANGUAGE_MATH',
    LANGUAGE_ARTS = 'LANGUAGE_ARTS',
    GENERAL = 'GENERAL',
}
