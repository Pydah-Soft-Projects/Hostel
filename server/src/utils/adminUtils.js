import { getCoursesFromSQL } from './courseBranchMapper.js';
import { fetchCourseByIdFromSQL, fetchBranchByIdFromSQL } from './sqlService.js';

/**
 * Normalize course name for robust comparison
 * Removes dots, spaces and converts to uppercase
 */
export const normalizeCourseName = (name) => {
  if (!name) return '';
  return name.trim().toUpperCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '');
};

/**
 * Resolve SQL course ID or legacy string to a consistent course name
 */
export const resolveCourseName = async (courseValue) => {
  if (!courseValue) return null;
  
  // If it's a SQL ID format (sql_1, sql_2, etc.) or just numeric
  let sqlId = null;
  if (typeof courseValue === 'string' && courseValue.startsWith('sql_')) {
    sqlId = parseInt(courseValue.replace('sql_', ''));
  } else if (/^\d+$/.test(courseValue.toString())) {
    sqlId = parseInt(courseValue);
  }

  if (sqlId !== null) {
    try {
      const result = await fetchCourseByIdFromSQL(sqlId);
      if (result.success && result.data) {
        return result.data.name || courseValue;
      }
    } catch (error) {
      console.error('Error resolving SQL course ID:', error);
    }
  }
  
  return courseValue;
};

/**
 * Resolve SQL branch ID or legacy string to a consistent branch name
 */
export const resolveBranchName = async (branchValue) => {
  if (!branchValue) return null;
  
  if (typeof branchValue === 'string' && branchValue.startsWith('sql_')) {
    try {
      const sqlBranchId = parseInt(branchValue.replace('sql_', ''));
      const result = await fetchBranchByIdFromSQL(sqlBranchId);
      if (result.success && result.data) {
        return result.data.name;
      }
    } catch (error) {
      console.error(`Error resolving branch ID ${branchValue}:`, error);
    }
  }
  
  return branchValue;
};

/**
 * Get allowed course names for an admin based on their assignments
 */
export const getAllowedCourseNames = async (admin) => {
  const { assignedCourses, assignedCollegeIds, assignedCollegeId, assignedLevels, assignedCollegeScopes, course } = admin;
  const allowedCourseNames = new Set();
  const hasExplicitCollegeScopes = assignedCollegeScopes?.length > 0;

  // 1. Legacy/Direct singular course (for principals)
  if (course && !hasExplicitCollegeScopes) {
    allowedCourseNames.add(course.trim());
  }

  // 2. Legacy/Direct Course Assignment (for sub_admins)
  if (!hasExplicitCollegeScopes && assignedCourses && assignedCourses.length > 0) {
    assignedCourses.forEach(c => {
      if (c) allowedCourseNames.add(c.trim());
    });
  }

  // 3. College & Level Based Assignment
  const colleges = (assignedCollegeIds && assignedCollegeIds.length > 0) 
    ? assignedCollegeIds 
    : (assignedCollegeId ? [assignedCollegeId] : []);
  
  const collegeScopes = assignedCollegeScopes?.length
    ? assignedCollegeScopes.map(scope => ({
      collegeId: Number(scope.collegeId),
      levels: (scope.levels || []).map(level => level.toLowerCase().trim())
    }))
    : colleges.map(collegeId => ({
      collegeId: Number(collegeId),
      levels: (assignedLevels || []).map(level => level.toLowerCase().trim())
    }));

  if (collegeScopes.length > 0) {
    try {
      const allSQLCourses = await getCoursesFromSQL();

      const matchedCourses = allSQLCourses.filter(course => {
        const scope = collegeScopes.find(item => item.collegeId === Number(course.college?.id));
        if (!scope) return false;
        return scope.levels.length === 0 || (course.level && scope.levels.includes(course.level.toLowerCase().trim()));
      });
      
      matchedCourses.forEach(c => {
        if (c.name) allowedCourseNames.add(c.name.trim());
      });
      
    //   console.log(`🔍 [adminUtils] Resolved ${matchedCourses.length} courses for Colleges [${colleges}] and Levels [${assignedLevels}]`);
    } catch (err) {
      console.error("Error resolving courses for college/level:", err);
    }
  }

  return Array.from(allowedCourseNames);
};
