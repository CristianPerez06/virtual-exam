import React from 'react'
export const AsyncCourses = React.lazy(() => import('../scenes/Courses/Index'))
export const AsyncUnits = React.lazy(() => import('../scenes/Units/Index'))
export const AsyncSettings = React.lazy(() => import('../scenes/Settings/Index'))
export const AsyncExercises = React.lazy(() => import('../scenes/Exercises/Index'))
export const AsyncExamTemplates = React.lazy(() => import('../scenes/ExamTemplates/Index'))
export const AsyncStudents = React.lazy(() => import('../scenes/Students/Index'))
export const AsyncExams = React.lazy(() => import('../scenes/Exams/Index'))
export const AsyncStudentExams = React.lazy(() => import('../scenes/StudentExams/Index'))
export const AsyncMetrics = React.lazy(() => import('../scenes/Metrics/Index'))


