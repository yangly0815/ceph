// -*- mode:C++; tab-width:8; c-basic-offset:2; indent-tabs-mode:t -*-
// vim: ts=8 sw=2 smarttab

#include "include/ceph_assert.h"
#include "gtest_seastar.h"

seastar_gtest_env_t seastar_test_suite_t::seastar_env;

seastar_gtest_env_t::seastar_gtest_env_t() :
  begin_fd{seastar::file_desc::eventfd(0, 0)} {}

void seastar_gtest_env_t::init(int argc, char **argv)
{
  thread = std::thread([argc, argv, this] { reactor(argc, argv); });
  eventfd_t result = 0;
  if (int r = ::eventfd_read(begin_fd.get(), &result); r < 0) {
    std::cerr << "unable to eventfd_read():" << errno << std::endl;
    throw std::runtime_error("Cannot start seastar");
  }
}

void seastar_gtest_env_t::stop()
{
  run([this] {
    on_end->write_side().signal(1);
    return seastar::now();
  });
  thread.join();
}

seastar_gtest_env_t::~seastar_gtest_env_t()
{}

void seastar_gtest_env_t::reactor(int argc, char** argv)
{
  app.run(argc, argv, [this] {
    on_end.reset(new seastar::readable_eventfd);
    return seastar::now().then([this] {
      ::eventfd_write(begin_fd.get(), 1);
	return seastar::now();
    }).then([this] {
      return on_end->wait().then([](size_t){});
    }).handle_exception([](auto ep) {
      std::cerr << "Error: " << ep << std::endl;
    }).finally([this] {
      on_end.reset();
    });
  });
}

int main(int argc, char **argv)
{
  ::testing::InitGoogleTest(&argc, argv);

  seastar_test_suite_t::seastar_env.init(argc, argv);

  seastar::global_logger_registry().set_all_loggers_level(
    seastar::log_level::debug
  );

  int ret = RUN_ALL_TESTS();

  seastar_test_suite_t::seastar_env.stop();
  return ret;
}
