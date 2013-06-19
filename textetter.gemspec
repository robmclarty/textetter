# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'textetter/version'

Gem::Specification.new do |spec|
  spec.name          = "textetter"
  spec.version       = Textetter::VERSION
  spec.authors       = ["Rob McLarty"]
  spec.email         = ["rob.mclarty@gmail.com"]
  spec.description   = %q{A Markdown text setter for your Rails app.}
  spec.summary       = %q{A Markdown text setter for your Rails app.}
  spec.homepage      = "https://github.com/robmclarty/textetter"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  s.add_dependency 'rails', '>= 3.1', '< 5.0'

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
