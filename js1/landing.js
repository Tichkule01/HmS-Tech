/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


 // PREVIEW_ONLY: This script is only for preview isolation and will be removed before publishing
            // Listen for content changes in the contentEditable body
            document.addEventListener('DOMContentLoaded', function() {
              const body = document.body;
              let timeout;
              
              // Intercept all link clicks to prevent navigation within iframe
              document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link) {
                  // Get the raw href attribute value (not the resolved URL)
                  const href = (link.getAttribute('href') || '').trim();
                  
                  // Check if it's a hash-only link (#, empty, or starts with #)
                  // Hash links are: empty, "#", or anything starting with "#" that doesn't have a protocol
                  const isHashLink = !href || 
                                    href === '#' || 
                                    (href.startsWith('#') && !href.includes('://'));
                  
                  // Always prevent default behavior first
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  
                  // For hash-only links (including empty or just #), do absolutely nothing
                  if (isHashLink) {
                    // Only check for valid anchor if it's not just "#" or empty
                    if (href && href !== '#') {
                      const hash = href.substring(1).trim();
                      if (hash) {
                        try {
                          const targetElement = document.getElementById(hash) || 
                                              document.querySelector('[name="' + hash + '"]');
                          // Only allow scrolling if the target element exists
                          if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            return false;
                          }
                        } catch (err) {
                          // Ignore errors, just prevent navigation
                        }
                      }
                    }
                    // For invalid, empty, or just "#" hash links, do nothing at all
                    return false;
                  }
                  
                  // For external links (not hash links), open in new tab
                  const hrefValue = link.href || '';
                  if (hrefValue) {
                    try {
                      window.open(hrefValue, '_blank', 'noopener,noreferrer');
                    } catch (err) {
                      // If popup blocked, just prevent navigation
                    }
                  }
                  
                  return false;
                }
              }, true); // Use capture phase to catch all clicks
              
              // Prevent hashchange events that might cause navigation
              window.addEventListener('hashchange', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                // Prevent URL change
                if (window.history && window.history.replaceState) {
                  const url = window.location.href.split('#')[0];
                  window.history.replaceState(null, '', url);
                }
                return false;
              }, true);
              
              // Prevent form submissions that would navigate the iframe
              document.addEventListener('submit', function(e) {
                const form = e.target;
                if (form && form.tagName === 'FORM') {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }, true);
              
              body.addEventListener('input', function() {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                  const content = body.innerHTML;
                  // Security: Only send postMessage to same origin
                  // Using window.location.origin ensures we don't leak content to external frames
                  const targetOrigin = window.location.origin;
                  window.parent.postMessage({
                    type: 'contentChange',
                    content: content
                  }, targetOrigin);
                }, 300); // Debounce for 300ms
              });
              
              // Also listen for paste events
              body.addEventListener('paste', function() {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                  const content = body.innerHTML;
                  // Security: Only send postMessage to same origin
                  const targetOrigin = window.location.origin;
                  window.parent.postMessage({
                    type: 'contentChange',
                    content: content
                  }, targetOrigin);
                }, 100);
              });
            });