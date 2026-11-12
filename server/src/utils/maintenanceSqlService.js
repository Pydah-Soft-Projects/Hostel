import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from server/.env regardless of CWD
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

let maintenancePool = null;
let cachedColumns = null;
let cachedCategories = null;
let categoriesCacheTime = 0;

/**
 * Initialize MySQL connection pool specifically for maintenance_db
 */
export const initializeMaintenancePool = () => {
  if (maintenancePool) {
    return maintenancePool;
  }

  const host = process.env.MAINTENANCE_DB_HOST || process.env.DB_HOST;
  const port = parseInt(process.env.MAINTENANCE_DB_PORT || process.env.DB_PORT, 10) || 3306;
  const user = process.env.MAINTENANCE_DB_USER || process.env.DB_USER;
  const password = process.env.MAINTENANCE_DB_PASSWORD || process.env.DB_PASSWORD;
  const database = process.env.MAINTENANCE_DB_NAME || 'maintenance_db';
  const useSSL = process.env.MAINTENANCE_DB_SSL === 'true' || process.env.DB_SSL === 'true';

  const config = {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 50,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 30000,
    acquireTimeout: 30000,
    timeout: 30000,
    multipleStatements: false,
    dateStrings: false
  };

  if (useSSL) {
    config.ssl = {
      rejectUnauthorized: false
    };
  }

  maintenancePool = mysql.createPool(config);
  console.log(`✅ Maintenance MySQL pool initialized (database: ${database})`);
  return maintenancePool;
};

export const getMaintenancePool = () => {
  if (!maintenancePool) {
    return initializeMaintenancePool();
  }
  return maintenancePool;
};

/**
 * Test SQL connection to maintenance_db
 */
export const testMaintenanceConnection = async () => {
  try {
    const pool = getMaintenancePool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { success: true, message: 'Maintenance DB connection successful' };
  } catch (error) {
    console.error('❌ Maintenance DB connection test failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch and cache available columns in maintenance_db.complaints
 */
export const getAvailableColumns = async () => {
  if (cachedColumns) return cachedColumns;
  try {
    const pool = getMaintenancePool();
    const [rows] = await pool.query('SHOW COLUMNS FROM complaints;');
    cachedColumns = new Set(rows.map(r => r.Field));
    return cachedColumns;
  } catch (err) {
    console.error('⚠️ Could not fetch columns from maintenance_db.complaints:', err.message);
    // Return standard minimum columns fallback
    return new Set([
      'complaint_number', 'requester_user_id', 'requester_type', 'requester_name',
      'requester_identifier', 'category_id', 'sub_category_id', 'college_name',
      'block_no', 'floor_no', 'room_no', 'title', 'description', 'photo_url',
      'status', 'priority', 'assignments', 'comments', 'status_history'
    ]);
  }
};

/**
 * Invalidate column cache so newly executed SQL alters are recognized
 */
export const invalidateColumnCache = () => {
  cachedColumns = null;
};

/**
 * Load and cache active categories from maintenance_db
 */
export const getActiveCategories = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedCategories && (now - categoriesCacheTime < 5 * 60 * 1000)) {
    return cachedCategories;
  }
  try {
    const pool = getMaintenancePool();
    const [rows] = await pool.query('SELECT id, name, description, parent_id, is_active FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC;');
    cachedCategories = rows;
    categoriesCacheTime = now;
    return rows;
  } catch (err) {
    console.error('⚠️ Could not fetch categories from maintenance_db:', err.message);
    return cachedCategories || [];
  }
};

/**
 * Get categories organized as hierarchy (parent categories with sub_categories)
 * Used directly by the frontend to render dynamic category dropdowns.
 */
export const getMaintenanceCategoriesTree = async (forceRefresh = false) => {
  const allActive = await getActiveCategories(forceRefresh);

  const mainCategories = allActive.filter(cat => !cat.parent_id);
  const subCategories = allActive.filter(cat => cat.parent_id);

  return mainCategories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    sub_categories: subCategories
      .filter(sub => sub.parent_id === category.id)
      .map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description
      }))
  }));
};

/**
 * Generate standard maintenance ticket number (TKT-YYYY-XXXXXX-XXX)
 */
export const generateTicketNumber = () => {
  const year = new Date().getFullYear();
  const timeSlice = Date.now().toString().slice(-6);
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TKT-${year}-${timeSlice}-${randomPart}`;
};

/**
 * Smart Category Mapper from Hostel categories to Maintenance DB IDs
 * 
 * Known Maintenance DB Categories:
 * 1: Canteen (parent_id: null) -> 2: Food, 3: Higiene
 * 4: Hostel (parent_id: null) -> 5: Power, 6: Wifi
 * 7: Civil Related (parent_id: null) -> 8: Repair Works
 * 9: Plumbing (parent_id: null)
 * 10: Electrical (parent_id: null)
 * 11: Carpentry (parent_id: null)
 * 12: House Keeping & Hygiene (parent_id: null)
 */
export const resolveCategoryIds = async (categoryName, subCategoryName) => {
  const categories = await getActiveCategories();
  
  const normCat = (categoryName || '').trim().toLowerCase();
  const normSub = (subCategoryName || '').trim().toLowerCase();

  let categoryId = null;
  let subCategoryId = null;

  // 1. Direct subcategory matches for Maintenance
  if (normSub === 'plumbing' || normCat === 'plumbing') {
    const plumb = categories.find(c => c.name.toLowerCase().includes('plumb'));
    categoryId = plumb?.id || 9;
  } else if (normSub === 'electricity' || normSub === 'electrical' || normCat === 'electrical') {
    const elec = categories.find(c => c.name.toLowerCase().includes('electric'));
    categoryId = elec?.id || 10;
  } else if (normSub === 'housekeeping' || normCat === 'housekeeping') {
    const house = categories.find(c => c.name.toLowerCase().includes('house keeping') || c.name.toLowerCase().includes('hygiene'));
    categoryId = house?.id || 12;
  } else if (normCat === 'internet' || normSub.includes('wifi') || normCat.includes('wifi')) {
    // Under Hostel -> Wifi (id 6)
    const wifi = categories.find(c => c.name.toLowerCase() === 'wifi');
    const hostel = categories.find(c => c.name.toLowerCase() === 'hostel');
    categoryId = wifi?.parent_id || hostel?.id || 4;
    subCategoryId = wifi?.id || 6;
  } else if (normCat === 'canteen') {
    const canteen = categories.find(c => c.name.toLowerCase() === 'canteen');
    const food = categories.find(c => c.name.toLowerCase() === 'food');
    categoryId = canteen?.id || 1;
    subCategoryId = food?.id || 2;
  } else {
    // Look up by category name in categories table
    const matchedCat = categories.find(c => c.name.toLowerCase() === normCat && !c.parent_id);
    if (matchedCat) {
      categoryId = matchedCat.id;
      if (normSub) {
        const matchedSub = categories.find(c => c.name.toLowerCase() === normSub && c.parent_id === matchedCat.id);
        if (matchedSub) subCategoryId = matchedSub.id;
      }
    } else {
      // Fallback to Hostel category (id 4)
      const hostel = categories.find(c => c.name.toLowerCase() === 'hostel');
      categoryId = hostel?.id || 4;
    }
  }

  return { categoryId, subCategoryId };
};

/**
 * Insert a complaint directly into maintenance_db.complaints
 * Gracefully adapts to columns currently existing in the database table.
 */
export const insertComplaintToMaintenanceDb = async ({
  complaintNumber = null,
  referenceSite = 'HMS',
  requesterType = 'student', // 'student' or 'staff'
  requesterName = null,
  requesterIdentifier = null, // roll number / admission number / staff username
  requesterPhone = null,
  requesterEmail = null,
  category = null,
  subCategory = null,
  categoryId = null,
  subCategoryId = null,
  collegeId = null,
  collegeName = null,
  blockNo = null, // Hostel name / Block
  floorNo = null,
  roomNo = null,
  bedNo = null,
  title = null,
  description = null,
  photoUrl = null,
  priority = 'medium',
  status = 'pending',
  source = 'hostel',
  complaintType = 'student', // 'student' or 'facility'
  hostelId = null,
  hostelName = null,
  mongoComplaintId = null,
  wardenId = null,
  wardenName = null
}) => {
  const pool = getMaintenancePool();
  const availableCols = await getAvailableColumns();
  const ticketNumber = complaintNumber || generateTicketNumber();

  let finalCatId = categoryId ? parseInt(categoryId, 10) : null;
  let finalSubCatId = subCategoryId ? parseInt(subCategoryId, 10) : null;

  if (!finalCatId) {
    const resolved = await resolveCategoryIds(category, subCategory);
    finalCatId = resolved.categoryId;
    if (!finalSubCatId) finalSubCatId = resolved.subCategoryId;
  }

  const initialHistory = [{
    id: Date.now(),
    old_status: null,
    new_status: status || 'pending',
    changed_by: null,
    notes: 'Submitted via Hostel Management Portal',
    created_at: new Date().toISOString()
  }];

  // Construct column -> value map
  const candidateData = {
    complaint_number: ticketNumber,
    requester_user_id: null,
    requester_type: requesterType === 'staff' ? 'staff' : 'student',
    reference_site: referenceSite || 'HMS',
    requester_name: requesterName,
    requester_identifier: requesterIdentifier,
    requester_phone: requesterPhone,
    requester_email: requesterEmail,
    category_id: finalCatId,
    sub_category_id: finalSubCatId,
    college_id: collegeId,
    college_name: collegeName,
    block_no: blockNo || hostelName,
    floor_no: floorNo,
    room_no: roomNo,
    bed_no: bedNo,
    title: (title || `${category}${subCategory ? ' - ' + subCategory : ''}`).slice(0, 255),
    description: description || '',
    photo_url: photoUrl,
    status: status || 'pending',
    priority: priority || 'medium',
    assignments: JSON.stringify([]),
    comments: JSON.stringify([]),
    status_history: JSON.stringify(initialHistory),
    source,
    complaint_type: complaintType || 'student',
    hostel_id: hostelId ? String(hostelId) : null,
    hostel_name: hostelName,
    mongo_complaint_id: mongoComplaintId ? String(mongoComplaintId) : null,
    warden_id: wardenId ? String(wardenId) : null,
    warden_name: wardenName
  };

  // Filter only columns that actually exist in the table right now
  const insertCols = [];
  const insertValues = [];
  const placeholders = [];

  for (const [col, val] of Object.entries(candidateData)) {
    if (availableCols.has(col) && val !== undefined) {
      insertCols.push(`\`${col}\``);
      insertValues.push(val);
      placeholders.push('?');
    }
  }

  const sql = `INSERT INTO \`complaints\` (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')});`;
  const [result] = await pool.query(sql, insertValues);

  console.log(`✅ Complaint inserted into maintenance_db.complaints! (ID: ${result.insertId}, Number: ${ticketNumber})`);

  return {
    insertId: result.insertId,
    complaintNumber: ticketNumber,
    categoryId: finalCatId,
    subCategoryId: finalSubCatId
  };
};

/**
 * Status mapping from Hostel statuses to Maintenance DB statuses
 */
export const mapHostelStatusToMaintenance = (hostelStatus) => {
  switch (hostelStatus) {
    case 'Received':
      return 'pending';
    case 'In Progress':
      return 'approaching';
    case 'Resolved':
      return 'completed';
    case 'Closed':
      return 'closed';
    default:
      return 'pending';
  }
};

/**
 * Update complaint status in maintenance_db
 */
export const updateMaintenanceComplaintStatus = async (complaintIdentifier, newHostelStatus, note = '', changedByName = 'Hostel Admin') => {
  try {
    const pool = getMaintenancePool();
    const maintStatus = mapHostelStatusToMaintenance(newHostelStatus);

    // Find row by complaint_number or id
    let row = null;
    if (typeof complaintIdentifier === 'object' && complaintIdentifier !== null) {
      const { complaintNumber, maintenanceDbId, id } = complaintIdentifier;
      if (complaintNumber) {
        const [r] = await pool.query('SELECT id, status, status_history FROM complaints WHERE complaint_number = ? LIMIT 1;', [complaintNumber]);
        if (r && r.length) row = r[0];
      }
      if (!row && (maintenanceDbId || id)) {
        const numId = maintenanceDbId || id;
        if (/^\d+$/.test(String(numId))) {
          const [r] = await pool.query('SELECT id, status, status_history FROM complaints WHERE id = ? LIMIT 1;', [numId]);
          if (r && r.length) row = r[0];
        }
      }
    } else {
      const strId = String(complaintIdentifier);
      if (/^\d+$/.test(strId)) {
        const [r] = await pool.query('SELECT id, status, status_history FROM complaints WHERE id = ? LIMIT 1;', [strId]);
        if (r && r.length) row = r[0];
      } else {
        const [r] = await pool.query('SELECT id, status, status_history FROM complaints WHERE complaint_number = ? LIMIT 1;', [strId]);
        if (r && r.length) row = r[0];
      }
    }

    if (!row) {
      console.warn(`⚠️ Complaint not found in maintenance_db for identifier:`, complaintIdentifier);
      return false;
    }
    let history = [];
    try {
      history = typeof row.status_history === 'string' ? JSON.parse(row.status_history) : (row.status_history || []);
    } catch (_) {
      history = [];
    }

    history.push({
      id: Date.now(),
      old_status: row.status,
      new_status: maintStatus,
      changed_by: changedByName,
      notes: note || `Status updated to ${newHostelStatus} from Hostel Portal`,
      created_at: new Date().toISOString()
    });

    const isResolved = maintStatus === 'completed';
    const isClosed = maintStatus === 'closed';

    let updateSql = 'UPDATE complaints SET status = ?, status_history = ?, updated_at = NOW()';
    const params = [maintStatus, JSON.stringify(history)];

    if (isResolved) {
      updateSql += ', resolved_at = NOW()';
    }
    if (isClosed) {
      updateSql += ', closed_at = NOW()';
    }

    updateSql += ' WHERE id = ?';
    params.push(row.id);

    await pool.query(updateSql, params);
    console.log(`✅ Status updated in maintenance_db for complaint #${row.id} -> ${maintStatus}`);
    return true;
  } catch (err) {
    console.error('❌ Error updating maintenance complaint status:', err.message);
    return false;
  }
};

/**
 * Save student feedback into maintenance_db.complaints
 */
export const saveMaintenanceFeedback = async (complaintIdentifier, feedbackData) => {
  try {
    const pool = getMaintenancePool();
    let row = null;

    if (typeof complaintIdentifier === 'object' && complaintIdentifier !== null) {
      const { complaintNumber, maintenanceDbId, id } = complaintIdentifier;
      if (complaintNumber) {
        const [r] = await pool.query('SELECT id, status_history FROM complaints WHERE complaint_number = ? LIMIT 1;', [complaintNumber]);
        if (r && r.length) row = r[0];
      }
      if (!row && (maintenanceDbId || id)) {
        const numId = maintenanceDbId || id;
        if (/^\d+$/.test(String(numId))) {
          const [r] = await pool.query('SELECT id, status_history FROM complaints WHERE id = ? LIMIT 1;', [numId]);
          if (r && r.length) row = r[0];
        }
      }
    } else {
      const strId = String(complaintIdentifier);
      if (/^\d+$/.test(strId)) {
        const [r] = await pool.query('SELECT id, status_history FROM complaints WHERE id = ? LIMIT 1;', [strId]);
        if (r && r.length) row = r[0];
      } else {
        const [r] = await pool.query('SELECT id, status_history FROM complaints WHERE complaint_number = ? LIMIT 1;', [strId]);
        if (r && r.length) row = r[0];
      }
    }

    if (!row) {
      console.warn('⚠️ Could not find maintenance complaint row to save feedback for:', complaintIdentifier);
      return false;
    }

    const feedbackObj = {
      is_satisfied: Boolean(feedbackData.isSatisfied),
      rating: feedbackData.isSatisfied ? 5 : 2,
      comment: feedbackData.comment || null,
      submitted_at: new Date().toISOString()
    };

    let history = [];
    try {
      history = typeof row.status_history === 'string' ? JSON.parse(row.status_history) : (row.status_history || []);
    } catch (_) {
      history = [];
    }

    const nextStatus = feedbackData.isSatisfied ? 'closed' : 'pending';
    history.push({
      id: Date.now(),
      old_status: 'completed',
      new_status: nextStatus,
      notes: feedbackData.isSatisfied ? 'Student provided positive feedback. Complaint closed.' : 'Student not satisfied. Reopened from Hostel Portal.',
      created_at: new Date().toISOString()
    });

    const updateSql = `
      UPDATE complaints 
      SET feedback = ?, status = ?, status_history = ?, 
          closed_at = ${feedbackData.isSatisfied ? 'NOW()' : 'NULL'}, 
          updated_at = NOW() 
      WHERE id = ?;
    `;

    await pool.query(updateSql, [JSON.stringify(feedbackObj), nextStatus, JSON.stringify(history), row.id]);
    console.log(`✅ Feedback saved to maintenance_db for complaint #${row.id} (new status: ${nextStatus})`);
    return true;
  } catch (err) {
    console.error('❌ Error saving feedback to maintenance_db:', err.message);
    return false;
  }
};

/**
 * Fetch live complaint status, assignments, and history from maintenance_db
 * by complaint numbers (e.g. TKT-2026-...), student roll/admission numbers, or numeric IDs
 */
export const fetchMaintenanceComplaintsData = async ({ complaintNumbers = [], identifiers = [], ids = [] }) => {
  try {
    const pool = getMaintenancePool();

    const cleanNumbers = (complaintNumbers || []).filter(Boolean).map(String);
    const cleanIdentifiers = (identifiers || []).filter(Boolean).map(String);
    const cleanIds = (ids || []).filter(Boolean).map(String).filter(id => /^\d+$/.test(id));

    if (cleanNumbers.length === 0 && cleanIdentifiers.length === 0 && cleanIds.length === 0) {
      return new Map();
    }

    const whereClauses = [];
    const params = [];

    if (cleanNumbers.length > 0) {
      whereClauses.push(`c.complaint_number IN (${cleanNumbers.map(() => '?').join(',')})`);
      params.push(...cleanNumbers);
    }

    if (cleanIdentifiers.length > 0) {
      whereClauses.push(`c.requester_identifier IN (${cleanIdentifiers.map(() => '?').join(',')})`);
      params.push(...cleanIdentifiers);
    }

    if (cleanIds.length > 0) {
      whereClauses.push(`c.id IN (${cleanIds.map(() => '?').join(',')})`);
      params.push(...cleanIds);
    }

    const sql = `
      SELECT c.*, cat.name AS category_name, sub.name AS sub_category_name
      FROM complaints c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN categories sub ON c.sub_category_id = sub.id
      WHERE ${whereClauses.join(' OR ')}
      ORDER BY c.created_at DESC;
    `;

    const [rows] = await pool.query(sql, params);
    if (!rows || rows.length === 0) return new Map();

    // Collect all user IDs involved in assignments
    const userIds = new Set();
    rows.forEach(row => {
      let assignments = [];
      try {
        assignments = typeof row.assignments === 'string' ? JSON.parse(row.assignments) : (row.assignments || []);
      } catch (_) {}
      assignments.forEach(a => {
        if (a && a.assigned_to) userIds.add(Number(a.assigned_to));
        if (a && a.assigned_by) userIds.add(Number(a.assigned_by));
      });
    });

    const userMap = new Map();
    if (userIds.size > 0) {
      const [users] = await pool.query(
        `SELECT id, name, username, email, phone, role FROM users WHERE id IN (?);`,
        [[...userIds]]
      );
      users.forEach(u => userMap.set(Number(u.id), u));
    }

    const STATUS_MAP = {
      pending: 'Pending',
      approaching: 'Approaching',
      resolving: 'Resolving',
      completed: 'Completed',
      closed: 'Closed',
      rejected: 'Rejected'
    };

    const resultMap = new Map();

    rows.forEach(row => {
      let assignments = [];
      try {
        assignments = typeof row.assignments === 'string' ? JSON.parse(row.assignments) : (row.assignments || []);
      } catch (_) {}

      const enrichedAssignments = assignments.map(a => {
        const user = userMap.get(Number(a.assigned_to));
        return {
          id: a.id,
          assignedToId: a.assigned_to,
          name: user?.name || a.assigned_to_name || 'Assigned Staff',
          username: user?.username || null,
          phone: user?.phone || null,
          email: user?.email || null,
          role: user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Staff',
          category: row.category_name,
          notes: a.notes || null,
          isActive: a.is_active !== false,
          assignedAt: a.assigned_at
        };
      }).filter(a => a.isActive);

      const primaryAssignee = enrichedAssignments[0] || null;

      let statusHistory = [];
      try {
        statusHistory = typeof row.status_history === 'string' ? JSON.parse(row.status_history) : (row.status_history || []);
      } catch (_) {}

      const rawStatus = (row.status || 'pending').toLowerCase();
      const statusLabel = STATUS_MAP[rawStatus] || (row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending');

      const entry = {
        maintenanceId: row.id,
        complaintNumber: row.complaint_number,
        title: row.title,
        description: row.description,
        priority: row.priority,
        rawStatus,
        statusLabel,
        assignments: enrichedAssignments,
        assignedTo: primaryAssignee,
        statusHistory,
        feedback: row.feedback,
        photoUrl: row.photo_url,
        resolvedAt: row.resolved_at,
        closedAt: row.closed_at,
        createdAt: row.created_at,
        categoryName: row.category_name,
        subCategoryName: row.sub_category_name
      };

      if (row.complaint_number) resultMap.set(row.complaint_number, entry);
      resultMap.set(String(row.id), entry);
    });

    return resultMap;
  } catch (error) {
    console.error('❌ Error fetching maintenance complaints data:', error.message);
    return new Map();
  }
};

export default {
  initializeMaintenancePool,
  getMaintenancePool,
  testMaintenanceConnection,
  getAvailableColumns,
  invalidateColumnCache,
  getActiveCategories,
  getMaintenanceCategoriesTree,
  generateTicketNumber,
  resolveCategoryIds,
  insertComplaintToMaintenanceDb,
  mapHostelStatusToMaintenance,
  updateMaintenanceComplaintStatus,
  saveMaintenanceFeedback,
  fetchMaintenanceComplaintsData
};
