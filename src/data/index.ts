import { FacultyMember, DrdoLab } from '../types';
import rawFaculty from './iitFaculty.json';
import rawDrdo from './drdoLabs.json';

export const iitFacultyList: FacultyMember[] = rawFaculty as FacultyMember[];
export const drdoLabsList: DrdoLab[] = rawDrdo as DrdoLab[];

export interface SearchMatchReason {
  field: 'name' | 'institution' | 'department' | 'interests' | 'location';
  matchedTerm: string;
}

/**
 * Transparent keyword relevance computation
 * Explains WHY a result appears without inventing fake AI fit percentages.
 */
export function explainFacultyMatch(faculty: FacultyMember, query: string): SearchMatchReason[] {
  if (!query.trim()) return [];
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const reasons: SearchMatchReason[] = [];

  for (const term of terms) {
    if (faculty.name.toLowerCase().includes(term)) {
      reasons.push({ field: 'name', matchedTerm: term });
    } else if (faculty.researchInterests.toLowerCase().includes(term)) {
      reasons.push({ field: 'interests', matchedTerm: term });
    } else if (faculty.department.toLowerCase().includes(term)) {
      reasons.push({ field: 'department', matchedTerm: term });
    } else if (faculty.institution.toLowerCase().includes(term)) {
      reasons.push({ field: 'institution', matchedTerm: term });
    } else if (faculty.location.toLowerCase().includes(term)) {
      reasons.push({ field: 'location', matchedTerm: term });
    }
  }

  return reasons;
}

export function explainDrdoMatch(lab: DrdoLab, query: string): string[] {
  if (!query.trim()) return [];
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const matchedPoints: string[] = [];

  for (const term of terms) {
    if (lab.labName.toLowerCase().includes(term) || lab.acronym.toLowerCase().includes(term)) {
      matchedPoints.push(`Lab name or acronym contains "${term}"`);
    } else if (lab.researchAreas.some((a) => a.toLowerCase().includes(term))) {
      matchedPoints.push(`Research domain matches "${term}"`);
    } else if (lab.location.toLowerCase().includes(term) || lab.state.toLowerCase().includes(term)) {
      matchedPoints.push(`Location matches "${term}"`);
    }
  }

  return matchedPoints;
}
