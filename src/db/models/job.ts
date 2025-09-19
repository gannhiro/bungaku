import {database} from '@db';
import {Model} from '@nozbe/watermelondb';
import {field, text, date, json, writer} from '@nozbe/watermelondb/decorators';
import {JobPayload} from '@store';

type UpdateJobProps = {
  status?: JobPayload['status'];
  progress?: number;
  error?: string;
};

type JobPayloadDb = Omit<JobPayload, 'jobId' | 'status' | 'progress' | 'errorMessage'>;

export default class Job extends Model {
  static table = 'jobs';

  @text('job_id') jobId!: string;
  @text('status') status!: JobPayload['status'];
  @field('progress') progress!: number;
  @text('error_message') errorMessage?: string;
  @json('payload', raw => raw) payload!: JobPayloadDb;

  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  static async getAllJobs(): Promise<JobPayload[]> {
    const jobCollection = database.collections.get<Job>(this.table);
    const jobs = await jobCollection.query().fetch();

    return jobs.map(job => ({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      error: job.errorMessage,
      ...job.payload,
    }));
  }

  static async getJobById(jobId: string): Promise<Job | undefined> {
    const jobCollection = database.get<Job>(this.table);
    try {
      const job = await jobCollection.find(jobId);
      return job;
    } catch (error) {
      return undefined;
    }
  }

  static async createJob(payload: JobPayload): Promise<Job> {
    let newJob: Job;
    await database.write(async () => {
      const jobCollection = database.collections.get<Job>(this.table);
      newJob = await jobCollection.create(job => {
        const {jobId, status, progress, error, ...rest} = payload;
        job._raw.id = jobId;
        job.jobId = jobId;
        job.status = status;
        job.progress = progress;
        job.errorMessage = error;
        job.payload = rest;
        job.createdAt = new Date();
        job.updatedAt = new Date();
      });
    });

    return newJob!;
  }

  @writer async updateState(updates: UpdateJobProps) {
    const {status, progress, error} = updates;
    await this.update(jobDb => {
      if (status) jobDb.status = status;
      if (progress) jobDb.progress = progress;
      if (error) jobDb.errorMessage = error;
      jobDb.updatedAt = new Date();
    });
  }
}
