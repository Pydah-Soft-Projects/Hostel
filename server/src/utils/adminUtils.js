import { getCoursesFromSQL, getBranchesFromSQL } from './courseBranchMapper.js';
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
 * Comprehensive resolution of an admin/user's college, course, and branch scope.
 * Returns { isScoped: boolean, allowedCollegeIds: number[], allowedCourses: string[], allowedBranches: string[] }
 */
export const getAdminScopedAcademics = async (admin) => {
  if (!admin || admin.role === 'super_admin') {
    return {
      isScoped: false,
      allowedCollegeIds: [],
      allowedCourses: [],
      allowedBranches: []
    };
  }

  let customRole = null;
  if (admin.customRoleId) {
    if (admin.customRoleId.assignedCollegeIds || admin.customRoleId.assignedCourses) {
      customRole = admin.customRoleId;
    } else {
      try {
        const CustomRole = (await import('../models/CustomRole.js')).default;
        customRole = await CustomRole.findById(admin.customRoleId).lean();
      } catch (e) {
        console.error('Error fetching customRole for scope:', e);
      }
    }
  }

  const collegeIds = (admin.assignedCollegeIds && admin.assignedCollegeIds.length > 0)
    ? admin.assignedCollegeIds.map(Number)
    : (admin.assignedCollegeId ? [Number(admin.assignedCollegeId)] : ((customRole?.assignedCollegeIds?.length > 0) ? customRole.assignedCollegeIds.map(Number) : []));

  const scopes = (admin.assignedCollegeScopes && admin.assignedCollegeScopes.length > 0)
    ? admin.assignedCollegeScopes
    : (customRole?.assignedCollegeScopes || []);
  const assignedCourses = ((admin.assignedCourses && admin.assignedCourses.length > 0)
    ? admin.assignedCourses
    : (customRole?.assignedCourses || [])).filter(Boolean);
  const assignedBranches = ((admin.assignedBranches && admin.assignedBranches.length > 0)
    ? admin.assignedBranches
    : (customRole?.assignedBranches || [])).filter(Boolean);

  const hasScope = collegeIds.length > 0 || scopes.length > 0 || assignedCourses.length > 0 || assignedBranches.length > 0 || admin.course;
  if (!hasScope) {
    return {
      isScoped: false,
      allowedCollegeIds: [],
      allowedCourses: [],
      allowedBranches: []
    };
  }

  const allSQLCourses = await getCoursesFromSQL();
  const allSQLBranches = await getBranchesFromSQL();

  const allowedCoursesSet = new Set();
  const allowedBranchesSet = new Set();

  if (scopes.length > 0) {
    for (const scope of scopes) {
      const cId = Number(scope.collegeId);
      const collegeCourses = allSQLCourses.filter(c => Number(c.college?.id) === cId);
      
      const targetCourses = (scope.courses && scope.courses.length > 0)
        ? collegeCourses.filter(c => scope.courses.some(sc => normalizeCourseName(sc) === normalizeCourseName(c.name)))
        : (assignedCourses.length > 0 ? collegeCourses.filter(c => assignedCourses.some(ac => normalizeCourseName(ac) === normalizeCourseName(c.name))) : collegeCourses);

      targetCourses.forEach(c => {
        if (c.name) allowedCoursesSet.add(c.name.trim());
      });

      const targetCourseNames = targetCourses.map(c => normalizeCourseName(c.name));
      const collegeBranches = allSQLBranches.filter(b => {
        const bColId = Number(b.college?.id);
        const bCourseNorm = normalizeCourseName(b.courseName || b.course?.name);
        return (bColId === cId || targetCourseNames.includes(bCourseNorm)) && targetCourseNames.includes(bCourseNorm);
      });

      const targetBranches = (scope.branches && scope.branches.length > 0)
        ? collegeBranches.filter(b => scope.branches.some(sb => sb.trim().toUpperCase() === b.name.trim().toUpperCase()))
        : (assignedBranches.length > 0 ? collegeBranches.filter(b => assignedBranches.some(ab => ab.trim().toUpperCase() === b.name.trim().toUpperCase())) : collegeBranches);

      targetBranches.forEach(b => {
        if (b.name) allowedBranchesSet.add(b.name.trim());
      });
    }
  } else if (collegeIds.length > 0) {
    const rawCollegeCourses = allSQLCourses.filter(c => collegeIds.includes(Number(c.college?.id)));
    const collegeCourses = assignedCourses.length > 0
      ? rawCollegeCourses.filter(c => assignedCourses.some(ac => normalizeCourseName(ac) === normalizeCourseName(c.name)))
      : rawCollegeCourses;

    collegeCourses.forEach(c => {
      if (c.name) allowedCoursesSet.add(c.name.trim());
    });

    const targetCourseNames = collegeCourses.map(c => normalizeCourseName(c.name));
    const rawCollegeBranches = allSQLBranches.filter(b => {
      const bColId = Number(b.college?.id);
      const bCourseNorm = normalizeCourseName(b.courseName || b.course?.name);
      return (collegeIds.includes(bColId) || targetCourseNames.includes(bCourseNorm)) && targetCourseNames.includes(bCourseNorm);
    });
    const collegeBranches = assignedBranches.length > 0
      ? rawCollegeBranches.filter(b => assignedBranches.some(ab => ab.trim().toUpperCase() === b.name.trim().toUpperCase()))
      : rawCollegeBranches;

    collegeBranches.forEach(b => {
      if (b.name) allowedBranchesSet.add(b.name.trim());
    });
  }

  // Top level overrides if specified
  if (assignedCourses.length > 0 && allowedCoursesSet.size === 0) {
    assignedCourses.forEach(c => allowedCoursesSet.add(c.trim()));
  }
  if (admin.course && typeof admin.course === 'string') {
    allowedCoursesSet.add(admin.course.trim());
  }

  if (assignedBranches.length > 0 && allowedBranchesSet.size === 0) {
    assignedBranches.forEach(b => allowedBranchesSet.add(b.trim()));
  }
  if (admin.branch && typeof admin.branch === 'string') {
    allowedBranchesSet.add(admin.branch.trim());
  }

  let allowedCourses = Array.from(allowedCoursesSet);
  if (assignedCourses.length > 0) {
    const assignedNorm = assignedCourses.map(normalizeCourseName);
    allowedCourses = allowedCourses.filter(c => assignedNorm.includes(normalizeCourseName(c)));
    if (allowedCourses.length === 0) {
      allowedCourses = [...assignedCourses];
    }
  }

  let allowedBranches = Array.from(allowedBranchesSet);
  if (assignedBranches.length > 0) {
    const assignedBNorm = assignedBranches.map(b => b.trim().toUpperCase());
    allowedBranches = allowedBranches.filter(b => assignedBNorm.includes(b.trim().toUpperCase()));
    if (allowedBranches.length === 0) {
      allowedBranches = [...assignedBranches];
    }
  }

  return {
    isScoped: true,
    allowedCollegeIds: collegeIds,
    allowedCourses,
    allowedBranches
  };
};

/**
 * Get allowed course names for an admin based on their assignments
 */
export const getAllowedCourseNames = async (admin) => {
  const scoped = await getAdminScopedAcademics(admin);
  if (scoped.isScoped) {
    return scoped.allowedCourses;
  }
  return [];
};
