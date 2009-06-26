require File.dirname(__FILE__) + '/../spec_helper' 
require File.dirname(__FILE__) + '/../../lib/eol_data'
class EOL::NestedSet; end
EOL::NestedSet.send :extend, EOL::Data

# TODO get rid of this!  extract out of here ... used this to initially get this spec working (need to create TaxonConcepts)
class SearchSpec
  class << self

    def animal_kingdom
      @animal_kingdom ||= build_taxon_concept(:canonical_form => 'Animals',
                                              :parent_hierarchy_entry_id => 0,
                                              :depth => 0)
    end

    def nestify_everything_properly
      # for each Hierarchy, go and set the lft/rgt on all of this child nodes properly
      EOL::NestedSet.make_all_nested_sets
    end

  end
end

describe 'Search' do

  def create_taxa(namestring)

    taxa = build_taxon_concept(:canonical_form => namestring, :depth => 1,
                                :parent_hierarchy_entry_id => SearchSpec.animal_kingdom.hierarchy_entries.first.id)
    SearchSpec.nestify_everything_properly
    SearchSpec.recreate_normalized_names_and_links
    return taxa

  end
  
  before(:each) do
    Scenario.load :foundation
    TaxonConcept.delete_all
    Name.delete_all           # Lest we get duplicate strings...
    NormalizedName.delete_all # ...Just because I know searches are based on normalized names
  end

  it 'should return a helpful message if no results' do
    # JRice sez: While the fact that this fails within 'rake spec' indicates a problem (there should be 0 TCs when only foundation
    # is loaded), I am not sure this is a "helpful" assertion, in that it is NOT testing the helpful message being returned if there are
    # no results.  Better, perhaps to force the issue?  Line in question: 
    TaxonConcept.count.should == 0
    # My solution is in the "before each" clause (above)
    request('/search?q=tiger').body.should include("Your search on 'tiger' did not find any matches")
  end

  it 'should redirect to species page if only 1 possible match is found (also for pages/searchterm)' do

    # Same argument as above (by JRice):
    # TaxonConcept.count.should == 0
    tiger = create_taxa('Tiger')
    request('/search?q=tiger').should redirect_to("/pages/#{ tiger.id }")
    request('/search/tiger').should redirect_to("/pages/#{ tiger.id }")    

  end

  it 'should redirect to search page if a string is passed to a species page' do
  
      tiger = create_taxa('Tiger')
      request('/pages/tiger').should redirect_to("/search/tiger")
      
  end

  it 'should show a list of possible results (linking to /taxa/search_clicked) if more than 1 match is found  (also for pages/searchterm)' do

    lilly = create_taxa('Tiger Lilly')
    tiger = create_taxa('Tiger')

    body = request('/search?q=tiger').body
    body.should include(lilly.quick_scientific_name(:italicized))
    body.should include(tiger.quick_scientific_name(:italicized))
    body.should have_tag('a[href*=?]', %r{/taxa/search_clicked/#{ lilly.id }})
    body.should have_tag('a[href*=?]', %r{/taxa/search_clicked/#{ tiger.id }})

  end
  
end
