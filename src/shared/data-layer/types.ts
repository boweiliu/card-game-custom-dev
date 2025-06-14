
export type TypeBlob = {
  'clientEntityId': string;
  'clientVersionId': string;
  'clientSnapshotId': string;
  'serverEntityId': string;
  'serverVersionId': string;
  'serverSnapshotId': string;

  'clientEntityOrder': string | number;
  'clientVersionOrder': string | number;
  'clientSnapshotOrder': string | number;
  'serverEntityOrder': string | number;
  'serverVersionOrder': string | number;
  'serverSnapshotOrder': string | number;  
}

export type AssertExtends<T extends U, U> = true;