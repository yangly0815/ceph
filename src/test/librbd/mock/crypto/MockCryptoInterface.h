// -*- mode:C++; tab-width:8; c-basic-offset:2; indent-tabs-mode:t -*-
// vim: ts=8 sw=2 smarttab

#ifndef CEPH_TEST_LIBRBD_MOCK_CRYPTO_MOCK_CRYPTO_INTERFACE_H
#define CEPH_TEST_LIBRBD_MOCK_CRYPTO_MOCK_CRYPTO_INTERFACE_H

#include "include/buffer.h"
#include "gmock/gmock.h"
#include "librbd/crypto/CryptoInterface.h"

namespace librbd {
namespace crypto {

struct MockCryptoInterface : CryptoInterface {

  MOCK_METHOD2(encrypt, int(ceph::bufferlist*, uint64_t));
  MOCK_METHOD2(decrypt, int(ceph::bufferlist*, uint64_t));

  uint64_t get_block_size() const override {
    return 4096;
  }
};

} // namespace crypto
} // namespace librbd

#endif // CEPH_TEST_LIBRBD_MOCK_CRYPTO_MOCK_CRYPTO_INTERFACE_H
