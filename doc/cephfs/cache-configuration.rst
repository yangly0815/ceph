=======================
MDS Cache Configuration
=======================

The Metadata Server coordinates a distributed cache among all MDS and CephFS
clients. The cache serves to improve metadata access latency and allow clients
to safely (coherently) mutate metadata state (e.g. via `chmod`). The MDS issues
**capabilities** and **directory entry leases** to indicate what state clients
may cache and what manipulations clients may perform (e.g. writing to a file).

The MDS and clients both try to enforce a cache size. The mechanism for
specifying the MDS cache size is described below. Note that the MDS cache size
is a not a hard limit. The MDS always allows clients to lookup new metadata
which is loaded into the cache. This is an essential policy as its avoids
deadlock in client requests (some requests may rely on held capabilities before
capabilities are released).

When the MDS cache is too large, the MDS will **recall** client state so cache
items become unpinned and eligble to be dropped. The MDS can only drop cache
state when no clients refer to the metadata to be dropped. Also described below
is how to configure the MDS recall settings for your workload's needs. This is
necessary if the internal throttles on the MDS recall can not keep up with the
client workload.


MDS Cache Size
--------------

You can limit the size of the Metadata Server (MDS) cache by a byte count. This
is done through the `mds_cache_memory_limit` configuration. For example::

    ceph config set mds mds_cache_memory_limit 8GB

In addition, you can specify a cache reservation by using the
`mds_cache_reservation` parameter for MDS operations. The cache reservation is
limited as a percentage of the memory and is set to 5% by default. The intent
of this parameter is to have the MDS maintain an extra reserve of memory for
its cache for new metadata operations to use. As a consequence, the MDS should
in general operate below its memory limit because it will recall old state from
clients in order to drop unused metadata in its cache.

If the MDS cannot keep its cache under the target size, the MDS will send a
health alert to the Monitors indicating the cache is too large. This is
controlled by the `mds_health_cache_threshold` configuration which is by
default 150% of the maximum cache size.

Because the cache limit is not a hard limit, potential bugs in the CephFS
client, MDS, or misbehaving applications might cause the MDS to exceed its
cache size. The health warnings are intended to help the operator detect this
situation and make necessary adjustments or investigate buggy clients.

MDS Cache Trimming
------------------

There are two configurations for throttling the rate of cache trimming in the MDS:

::

    mds_cache_trim_threshold (default 64k)


and

::

    mds_cache_trim_decay_rate (default 1)


The intent of the throttle is to prevent the MDS from spending too much time
trimming its cache. This may limit its ability to handle client requests or
perform other upkeep.

The trim configurations control an internal **decay counter**. Anytime metadata
is trimmed from the cache, the counter is incremented.  The threshold sets the
maximum size of the counter while the decay rate indicates the exponential half
life for the counter. If the MDS is continually removing items from its cache,
it will reach a steady state of ``-ln(0.5)/rate*threshold`` items removed per
second.

The defaults are conservative and may need changed for production MDS with
large cache sizes.


MDS Recall
----------

MDS limits its recall of client state (capabilities/leases) to prevent creating
too much work for itself handling release messages from clients. This is controlled
via the following configurations:


The maximum number of capabilities to recall from a single client in a given recall
event::

    mds_recall_max_caps (default: 5000)

The threshold and decay rate for the decay counter on a session::

    mds_recall_max_decay_threshold (default: 16k)

and::

    mds_recall_max_decay_rate (default: 2.5 seconds)

The session decay counter controls the rate of recall for an individual
session. The behavior of the counter works the same as for cache trimming
above. Each capability that is recalled increments the counter.

There is also a global decay counter that throttles for all session recall::

    mds_recall_global_max_decay_threshold (default: 64k)

its decay rate is the same as ``mds_recall_max_decay_rate``. Any recalled
capability for any session also increments this counter.

If clients are slow to release state, the warning "failing to respond to cache
pressure" or ``MDS_HEALTH_CLIENT_RECALL`` will be reported. Each session's rate
of release is monitored by another decay counter configured by::

    mds_recall_warning_threshold (default: 32k)

and::

    mds_recall_warning_decay_rate (default: 60.0 seconds)

Each time a capability is released, the counter is incremented.  If clients do
not release capabilities quickly enough and there is cache pressure, the
counter will indicate if the client is slow to release state.

Some workloads and client behaviors may require faster recall of client state
to keep up with capability acquisition. It is recommended to increase the above
counters as needed to resolve any slow recall warnings in the cluster health
state.


Session Liveness
----------------

The MDS also keeps track of whether sessions are quiescent. If a client session
is not utilizing its capabilities or is otherwise quiet, the MDS will begin
recalling state from the session even if its not under cache pressure. This
helps the MDS avoid future work when the cluster workload is hot and cache
pressure is forcing the MDS to recall state. The expectation is that a client
not utilizing its capabilities is unlikely to use those capabilities anytime
in the near future.

Determining whether a given session is quiescent is controlled by the following
configuration variables::

    mds_session_cache_liveness_magnitude (default: 10)

and::

    mds_session_cache_liveness_decay_rate (default: 5min)

The configuration ``mds_session_cache_liveness_decay_rate`` indicates the
half-life for the decay counter tracking the use of capabilities by the client.
Each time a client manipulates or acquires a capability, the MDS will increment
the counter. This is a rough but effective way to monitor utilization of the
client cache.

The ``mds_session_cache_liveness_magnitude`` is a base-2 magnitude difference
of the liveness decay counter and the number of capabilities outstanding for
the session. So if the client has ``1*2^20`` (1M) capabilities outstanding and
only uses **less** than ``1*2^(20-mds_session_cache_liveness_magnitude)`` (1K
using defaults), the MDS will consider the client to be quiescent and begin
recall.


Capability Limit
----------------

The MDS also tries to prevent a single client from acquiring too many
capabilities. This helps prevent recovery from taking a long time in some
situations.  It is not generally necessary for a client to have such a large
cache. The limit is configured via::

    mds_max_caps_per_client (default: 1M)

It is not recommended to set this value above 5M but it may be helpful with
some workloads.
