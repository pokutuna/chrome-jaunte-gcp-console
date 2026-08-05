/**
 * How to add a new service:
 * 1. Create `src/services/<id>.ts` exporting a single `ServiceDef` (see
 *    other files in this directory for the shape, or `src/catalog.ts` for
 *    the full API).
 * 2. Add it to the `services` array below, roughly in the order it appears
 *    in the Google Cloud console's left-hand menu.
 * 3. Write `examples` for every page (real, synthetic console URLs), and at
 *    least one per resource page.
 * 4. Run `pnpm test` to verify `src/services/services.test.ts` passes.
 */

import {ServiceDef} from '../catalog.ts';
import {apis} from './apis.ts';
import {appengine} from './appengine.ts';
import {artifactregistry} from './artifactregistry.ts';
import {bigquery} from './bigquery.ts';
import {bigtable} from './bigtable.ts';
import {billing} from './billing.ts';
import {cloudbuild} from './cloudbuild.ts';
import {cloudscheduler} from './cloudscheduler.ts';
import {cloudtasks} from './cloudtasks.ts';
import {compute} from './compute.ts';
import {dataflow} from './dataflow.ts';
import {errors} from './errors.ts';
import {firestore} from './firestore.ts';
import {functions} from './functions.ts';
import {iam} from './iam.ts';
import {kubernetes} from './kubernetes.ts';
import {logging} from './logging.ts';
import {monitoring} from './monitoring.ts';
import {pubsub} from './pubsub.ts';
import {run} from './run.ts';
import {secretmanager} from './secretmanager.ts';
import {spanner} from './spanner.ts';
import {sql} from './sql.ts';
import {storage} from './storage.ts';
import {trace} from './trace.ts';
import {vertexai} from './vertexai.ts';

// Order by listed on the Google Cloud console menu.
export const services: ServiceDef[] = [
  // Admin
  iam,
  apis,
  billing,

  // Compute
  compute,
  kubernetes,
  appengine,
  functions,
  run,

  // Storage / Databases
  storage,
  bigtable,
  sql,
  spanner,
  firestore,

  // Big Data / AI
  bigquery,
  dataflow,
  vertexai,

  // Networking / Tools
  pubsub,
  cloudtasks,
  cloudscheduler,
  cloudbuild,
  artifactregistry,
  secretmanager,

  // Operations
  monitoring,
  logging,
  errors,
  trace,
];
