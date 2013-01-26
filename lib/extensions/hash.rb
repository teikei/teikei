# Extension to flatten a nested hash.
# Source: http://stackoverflow.com/a/12064796/356895

class Hash
  def unnest
    new_hash = {}
    each do |key,val|
      if val.is_a?(Hash)
        # new_hash.merge!(val.prefix_keys("#{key}-"))
        new_hash.merge!(val)
      else
        new_hash[key] = val
      end
    end
    new_hash
  end

  def prefix_keys(prefix)
    Hash[map{|key,val| [prefix + key, val]}].unnest
  end
end
