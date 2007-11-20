/**
 * =========================================================================
 * File        : file_stats.h
 * Project     : 0 A.D.
 * Description : gathers statistics from all file modules.
 * =========================================================================
 */

// license: GPL; see lib/license.txt

#ifndef INCLUDED_FILE_STATS
#define INCLUDED_FILE_STATS

#define FILE_STATS_ENABLED 1


enum FileIOImplentation { FI_LOWIO, FI_AIO, FI_BCACHE, FI_MAX_IDX };
enum FileOp { FO_READ, FO_WRITE };
enum CacheRet { CR_HIT, CR_MISS };

#include "io/block_cache.h"	// BlockId

#if FILE_STATS_ENABLED

// vfs
extern void stats_vfs_file_add(size_t file_size);
extern void stats_vfs_file_remove(size_t file_size);
extern void stats_vfs_init_start();
extern void stats_vfs_init_finish();

// file

// currently not called because string_pool is now in lib/allocators
extern void stats_unique_name(size_t name_len);
extern void stats_open(const char* atom_fn, size_t file_size);
extern void stats_close();

// file_buf
extern void stats_buf_alloc(size_t size, size_t alignedSize);
extern void stats_buf_free();
extern void stats_buf_ref();

// file_io
extern void stats_io_user_request(size_t user_size);

// this is used to measure effective throughput for the two
// synchronous IO variants.
// note: improved measurements of the actual aio throughput by instrumenting
// issue/wait doesn't work because IOManager's decompression may cause us to
// miss the exact end of IO, thus throwing off measurements.
class ScopedIoMonitor
{
public:
	ScopedIoMonitor();
	~ScopedIoMonitor();
	void NotifyOfSuccess(FileIOImplentation fi, char mode, size_t size);

private:
	double m_startTime;
};

extern void stats_io_check_seek(BlockId& blockId);
extern void stats_cb_start();
extern void stats_cb_finish();

// file_cache
extern void stats_cache(CacheRet cr, size_t size, const char* atom_fn);
extern void stats_block_cache(CacheRet cr);

// archive builder
extern void stats_ab_connection(bool already_exists);

extern void file_stats_dump();

#else

#define stats_vfs_file_add(file_size)
#define stats_vfs_file_remove(file_size)
#define stats_vfs_init_start()
#define stats_vfs_init_finish()
#define stats_unique_name(name_len)
#define stats_open(atom_fn, file_size)
#define stats_close()
#define stats_buf_alloc(size, alignedSize)
#define stats_buf_free()
#define stats_buf_ref()
#define stats_io_user_request(user_size)
class ScopedIoMonitor
{
public:
	ScopedIoMonitor() {}
	~ScopedIoMonitor() {}
	void NotifyOfSuccess(FileIOImplentation fi, char mode, size_t size) {}
};
#define stats_io_check_seek(blockId)
#define stats_cb_start()
#define stats_cb_finish()
#define stats_cache(cr, size, atom_fn)
#define stats_block_cache(cr)
#define stats_ab_connection(already_exists)
#define file_stats_dump()

#endif

#endif	// #ifndef INCLUDED_FILE_STATS
